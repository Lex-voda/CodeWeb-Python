import os
import re
import json
import inspect
import importlib.util

class StrategyModule:
    _registry = {}
    registry_info = {}
    project_root = None
    @classmethod
    def register(cls, name=None, comment=None):
        def decorator(func):
            nonlocal name, comment
            project = None
            if name is None:
                name = func.__name__
            # 获取函数的签名
            signature = inspect.signature(func)
            return_annotation = signature.return_annotation
            
            # 获取函数定义所在的文件路径
            func_file_path = inspect.getfile(func)
            # 向上遍历文件系统，检查每一级目录名称是否在self.projects中
            current_path = os.path.dirname(func_file_path)
            found = False
            while current_path:
                parent_dir_name = os.path.basename(current_path)
                if parent_dir_name in cls.projects:
                    found = True
                    project = parent_dir_name
                    break
                # 如果当前路径已经是根目录，则停止循环
                if os.path.dirname(current_path) == cls.project_root:
                    break
                current_path = os.path.dirname(current_path)

            if not found:
                raise ValueError(f"函数{func.__name__}所在的目录结构中没有找到任何项目文件夹")
            
            if project not in cls._registry:
                cls._registry[project] = {}
                cls.registry_info[project] = {}
            cls._registry[project][name] = {"func": func, "signature": signature, "return_annotation": return_annotation}
            cls.registry_info[project][name] = {"signature": signature, "return_annotation": return_annotation, "comment": comment}
            return func
        return decorator
        
    def __init__(self, resource_module):
        self.resource_module = resource_module
        self.sync(init=True)
        print(self._registry)
        
    def sync(self, init=False):
        if not init:
            self.resource_module.sync()
        self.project_root = self.resource_module.project_root
        StrategyModule.projects = self.resource_module.projects
        self.register_path = {task: self.resource_module.scan_for_register(task) for task in self.projects}
        for project in self.projects:
            for path in self.register_path[project]:
                self.registry_import(path)

    def registry_import(self, path):
        # 通过文件路径导入模块
        spec = importlib.util.spec_from_file_location(path.split('.')[0].split('\\')[-1], path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    
    def get_registry_info(cls):
        return cls.registry_info
    
        
    def execute_project(self,project_name, project, config):
        for task_name, task in project.items():
            self.execute_task(project_name, task, config)
    
    def execute_task(self,project_name, task, config):
        pre_args = None
        for strategy in task["strategy_queue"]:
            func_name = strategy["function"]
            kwargs = {}
            for args_name, args_value in strategy["args"].items():
                if args_value == "PRE_OUTPUT":
                    kwargs[args_name] = pre_args
                else:
                    kwargs[args_name] = config[args_value]
            print(f"执行{func_name}函数，参数为{kwargs}")
            pre_args = self.execute_strategy(project_name, func_name, **kwargs)
            print(f"执行结果为{pre_args}")
            
    def execute_strategy(self, project, name, *args, **kwargs):
        if project in self._registry:
            if name in self._registry[project]:
                # 获取注册的函数和其签名
                registered_func = self._registry[project][name]["func"]
                signature = self._registry[project][name]["signature"]
                # 检查提供的参数是否符合函数的签名
                bound_args = signature.bind(*args, **kwargs)
                bound_args.apply_defaults()
                return registered_func(*bound_args.args, **bound_args.kwargs)
            else:
                raise ValueError(f"函数 {name} 未注册")
        else:
            raise ValueError(f"模块 {project} 未注册")
        

class ResourceModule:
    def __init__(self, ignore_prefixes=None, ignore_suffixes=None):
        self.ignore_prefixes = ignore_prefixes if ignore_prefixes else [] # 忽略的文件夹前缀
        self.ignore_suffixes = ignore_suffixes if ignore_suffixes else [] # 忽略的文件后缀
        
        self.sync()


    def get_resource_files_path(self):
        def handle_directory(directory):
            dir_list = []
            for root, dirs, files in os.walk(directory):
                for dir in dirs:
                    if not any(dir.startswith(prefix) for prefix in self.ignore_prefixes) and not any(dir.endswith(suffix) for suffix in self.ignore_suffixes):
                        dir_list.append({dir: handle_directory(os.path.join(root, dir))})
                for file in files:
                    if not any(file.startswith(prefix) for prefix in self.ignore_prefixes) and not any(file.endswith(suffix) for suffix in self.ignore_suffixes):
                        dir_list.append(file)
                break  # prevent os.walk from going into subdirectories
            return dir_list
        return {os.path.basename(self.project_root): handle_directory(self.project_root)}
    
    def restore_paths_from_dict(self, folder_dict, parent_path=''):
        paths = []
        for key, value in folder_dict.items():
            if isinstance(value, list):  # 当前键是文件夹名
                current_path = os.path.join(parent_path, key)
                for item in value:
                    if isinstance(item, dict):  # 子项是子文件夹
                        paths.extend(self.restore_paths_from_dict(item, current_path))
                    else:  # 子项是文件名
                        paths.append(os.path.join(current_path, item))
            else:  # 当前键是文件名
                paths.append(os.path.join(parent_path, key))
        return paths
    
    # 定位包含修饰器的包
    def scan_for_register(self, directory):
        """
        扫描指定目录下的所有Python文件，检查是否使用了StrategyModule.register修饰器。
        如果是，则记录文件名。
        """
        register_file = []
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith('.py'):
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        if re.search(r'@\w+\.register\([^)]*\)', f.read()):
                            register_file.append(filepath)
        return register_file
        
    def sync(self):
        self.project_root = os.path.dirname(
                                os.path.dirname(
                                    os.path.dirname(
                                        os.path.abspath(__file__))))
        self.resource_files_path_dict = self.get_resource_files_path()
        self.projects = [list(item.keys())[0] for item in list(self.resource_files_path_dict.values())[0] if isinstance(item, dict) and list(item.keys())[0] != 'CVWEB']
        self.resource_files_path_list = self.restore_paths_from_dict(self.resource_files_path_dict)
        
class ConfigModule:
    def __init__(self, system_config_path):
        self.user_config = {}
        
        self.sys_config = self.read_config(system_config_path)

    def set_config_path(self, path):
        self.config_path = path

    def read_config(self, path):
        if path and os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as file:
                return json.load(file)
        else:
            raise FileNotFoundError(f"配置文件不存在:{path}")

    def write_config(self, content):
        if self.config_path:
            with open(self.config_path, 'w', encoding='utf-8') as file:
                json.dump(content, file, ensure_ascii=False, indent=4)
        else:
            raise ValueError("配置文件路径未设置")

    def save_new_config(self, content, new_file_name):
        with open(new_file_name, 'w', encoding='utf-8') as file:
            json.dump(content, file, ensure_ascii=False, indent=4)
    
    # 同步系统配置
    def sys_sync(self):
        self.sys = self.sys_config(self.config_path)
        
    # 同步用户配置文件
    def sync(self, project, user_config_path):
        self.user_config[project] = self.read_config(user_config_path)
        print(f"用户配置文件{user_config_path}同步成功")
        
    # 获取数据库参数
    def get_db_params(self):
        return {
            "dbname": self.sys_config["database"]["db_name"],
            "user": self.sys_config["database"]["db_user"],
            "password": self.sys_config["database"]["db_password"],
            "host": self.sys_config["database"]["db_host"],
            "port": self.sys_config["database"]["db_port"],
        }