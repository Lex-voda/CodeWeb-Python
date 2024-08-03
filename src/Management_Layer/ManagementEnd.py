import os
import sys
import concurrent.futures
import ctypes
from utils import ThreadOutputStream 

class ManagementEnd:
    def __init__(self):
        print("---管理层启动---")
        
        self._request_admin_privileges()
        
        # 添加项目根目录到临时环境变量
        sys.path.append(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(os.path.abspath(__file__)))))
        from CodeWeb_python.api import StrategyModule, ResourceModule, ConfigModule, DBManager
        
        self.threads = {}   # 线程表
        self.output_dict = {}   # 输出表
        self.project_root = None   # 项目根目录绝对路径
        self.projects = []  # 项目集
        
        self.res_manager = ResourceModule(sys_name="CodeWeb_python") # 资源管理器
        self.strategy_manager = StrategyModule(self.res_manager)    # 策略管理器
        self.config_manager = ConfigModule(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sys_config.json'))     # 配置管理器
        self.db_manager = DBManager(self.config_manager.get_db_params())    # 数据库管理器
        
        # 同步
        self.sync()
        
        # 监控系统资源
        self._monitor_system_resources()
        
    def sync(self):
        """
        管理层同步
        """
        # 同步资源管理器
        self.res_manager.sync()
        self.project_root = self.res_manager.project_root
        self.projects = self.res_manager.projects
        
        # 同步策略管理器
        self.strategy_manager.sync()
        
        # 同步配置管理器
        self.sys_config = self.config_manager.sys_config
        
        # 链接数据库，获得用户配置文件路径，然后同步配置
        print(f"--开始同步用户配置文件--")
        for project_name in self.projects:
            self.sync_user_config(project_name)
        print("==用户配置文件同步完成==")
    
    def get_project_list(self):
        """
        获取项目列表
        """
        self.res_manager.sync()
        return self.projects
    
    def get_strategy_registry(self, project_name):
        """
        根据项目名获取策略注册表信息
        """
        self.strategy_manager.sync()
        return self.strategy_manager.get_registry_info(project_name)
    
    def get_directory_tree(self):
        """
        获取文件目录
        """
        return self.res_manager.get_directory_tree()
    
    def execute(self, message):
        """
        执行任务
        """
        output_message_dict = {}
        output_data_dict = {}
        print("--开始执行--")
        
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_project = {
                executor.submit(self._thread_wrapper, project_name, project, ThreadOutputStream()): project_name
                for project_name, project in message.items()
            }
            for future in concurrent.futures.as_completed(future_to_project):
                project_name = future_to_project[future]
                try:
                    output_data_dict[project_name], output_message_dict[project_name] = future.result()
                except Exception as exc:
                    print(f"{project_name} 生成异常: {exc}")
                
        print("==所有执行完成==")
        return output_message_dict, output_data_dict
    
    def remove_thread(self, project_name):
        """
        根据名字删除线程
        """
        if project_name in self.threads:
            del self.threads[project_name]
            print(f"线程 {project_name} 已删除")
        else:
            print(f"线程 {project_name} 不存在")
    
    def get_task_status(self, project_name=None):
        """
        获取任务状态
        """
        return project_name in self.threads
    
    def sync_user_config(self, project_name):
        """
        同步用户配置文件
        """
        user_config_path = self.db_manager.get_project_config_path(project_name)
        user_config_path = os.path.join(self.project_root, project_name, user_config_path)
        self.config_manager.sync(project_name, user_config_path)
        return self.config_manager.user_config[project_name]
    
    def update_user_config_path(self, project_name, config_path):
        """
        修改用户配置文件路径
        """
        self.db_manager.update_project_config_path(project_name, config_path)
    
    def update_user_config(self, project_name, content):
        """
        修改用户配置文件
        """
        user_config_path = self.db_manager.get_project_config_path(project_name)
        user_config_path = os.path.join(self.project_root, project_name, user_config_path)
        self.config_manager.write_config(user_config_path, content)
    
    def update_folder_or_file(self, past_new_path_content):
        """
        修改文件夹或文件
        past_new_path_content (tuple): (past_path, new_path, content)
        """
        self.res_manager.update_folder_or_file(past_new_path_content)
    
    def read_file(self, file_path):
        """
        读取文件
        """
        return self.res_manager.read_file(file_path)
    
    def get_system_monitor_info(self):
        """
        获取系统监控信息
        """
        return self.res_manager.monitor_queue.get(timeout=1.5)
    
    def _thread_wrapper(self, project_name, project, output):
        """
        包装线程的执行函数，在完成后从self.threads中删除线程
        """
        self.strategy_manager.execute_project(project_name, project, self.config_manager.user_config[project_name], output)
        self.output_dict[project_name] = ''.join(output.contents)
        del self.threads[project_name]
    
    def _monitor_system_resources(self):
        """
        启动系统资源监控线程
        """
        self.threads['monitor'] = self.res_manager.monitor_system_resources()
    
    def _request_admin_privileges(self):
        """
        请求管理员权限。如果当前脚本未以管理员身份运行，将重新启动脚本并申请管理员权限。
        """
        try:
            if ctypes.windll.shell32.IsUserAnAdmin():
                return True
        except:
            pass

        # 请求管理员权限
        print("请求管理员权限")
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)
    