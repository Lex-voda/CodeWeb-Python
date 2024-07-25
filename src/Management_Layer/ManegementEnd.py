import os
import sys
import json
import threading
import ctypes
from utils import ThreadOutputStream 

class ManegementEnd:
    def __init__(self):
        print("---管理层启动---")
        self.request_admin_privileges()
        print("==添加项目根目录到临时环境变量==")
        sys.path.append(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(os.path.abspath(__file__)))))
        from CV_WEB.api import StrategyModule, ResourceModule, ConfigModule, DBManager
        
        # 资源管理器
        self.res_manager = ResourceModule()
        
        # 策略管理器
        self.strategy_manager = StrategyModule(self.res_manager)
        
        # 配置管理器
        self.config_manager = ConfigModule(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sys_config.json'))
        
        # 数据库管理器
        self.db_manager = DBManager(self.config_manager.get_db_params())
        
        # 同步
        self.sync()
        
    def sync(self):
        # 同步资源管理器
        self.res_manager.sync()
        self.root = self.res_manager.project_root    # 项目根目录绝对路径
        self.projects = self.res_manager.projects    # 项目集
        
        # 同步策略管理器
        self.strategy_manager.sync()
        
        # 同步配置管理器
        self.sys_config = self.config_manager.sys_config
        
        # 链接数据库，获得用户配置文件路径，然后同步配置
        print(f"--开始同步用户配置文件--")
        for project in self.projects:
            user_config_path = self.db_manager.get_project_config(project)
            user_config_path = os.path.join(self.root, project, user_config_path)
            self.config_manager.sync(project, user_config_path)
            print(f"==用户配置文件{user_config_path}同步完成")
        print("==用户配置文件同步完成==")
    
    def execute(self, message):
        projects = []
        output_dict = {}
        print("--开始执行--")
        for project_name, project in message.items():
            output = ThreadOutputStream()
            thread = threading.Thread(target=self.strategy_manager.execute_project, args=(project_name, project, self.config_manager.user_config[project_name], output))
            projects.append(thread)
            thread.start()
        for project in projects:
            project.join()
            output_dict[project_name] = ''.join(output.contents)
        print(output_dict)
        print("==所有执行完成==")
    
    def request_admin_privileges(self):
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
        sys.exit(0)
        
        
if __name__ == '__main__':
    maneger = ManegementEnd()
    exam_json = """
    {
        "test_project": {
            "add_sub":{
                "STRATEGY_QUEUE":[
                    {
                        "ID":"strategy_1",
                        "FUNC":"add",
                        "ARGS": {
                            "a":"num1",
                            "b":"num2"
                        }
                    },
                    {
                        "ID":"strategy_2",
                        "FUNC":"sub",
                        "ARGS": {
                            "a":"strategy_1_OUTPUT",
                            "b":"num1"
                        }
                    }
                ],
                "ITER":false
            }
        }
    }
    """
    json_data = json.loads(exam_json)
    maneger.execute(json_data)
    exam_json = """
    {
        "test_project": {
            "add_sub_iter":{
                "STRATEGY_QUEUE":[
                    {
                        "ID":"strategy_1",
                        "FUNC":"iter",
                        "ARGS": {
                            "num":"num3"
                        }
                    },
                    {
                        "ID":"strategy_2",
                        "FUNC":"sub",
                        "ARGS": {
                            "a":"ITER_TERM",
                            "b":"num1"
                        }
                    }
                ],
                "ITER":true
            }
        }
    }
    """
    json_data = json.loads(exam_json)
    maneger.execute(json_data)
    for i in range(5):
        print(maneger.res_manager.monitor_system_resources())
    input("按任意键退出...")