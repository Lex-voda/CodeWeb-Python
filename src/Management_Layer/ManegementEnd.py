import os
import sys
import json
import threading

class ManegementEnd:
    def __init__(self):
        sys.path.append(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(os.path.abspath(__file__)))))
        from CVWEB.api import StrategyModule, ResourceModule, ConfigModule, DBManager
        
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
        for project in self.projects:
            user_config_path = self.db_manager.get_project_config(project)
            user_config_path = os.path.join(self.root, project, user_config_path)
            self.config_manager.sync(project, user_config_path)
    
    def execute(self, message):
        projects = []
        for project_name, project in message.items():
            thread = threading.Thread(target=self.strategy_manager.execute_project, args=(project_name, project, self.config_manager.user_config[project_name]))
            projects.append(thread)
            thread.start()
        for project in projects:
            project.join()
    
    
if __name__ == '__main__':
    maneger = ManegementEnd()
    exam_json = """
    {
        "test_project": {
            "add_sub":{
                "strategy_queue":[
                    {
                        "id":"strategy_1",
                        "function":"add",
                        "args": {
                            "a":"num1",
                            "b":"num2"
                        }
                    },
                    {
                        "id":"strategy_2",
                        "function":"sub",
                        "args": {
                            "a":"PRE_OUTPUT",
                            "b":"num1"
                        }
                    }
                ],
                "execution_order": ["strategy_1","strategy_2"],
                "iterator":null
            }
        }
    }
    """
    json_data = json.loads(exam_json)
    maneger.execute(json_data)