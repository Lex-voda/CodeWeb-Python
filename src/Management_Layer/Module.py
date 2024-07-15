import os
import re
import json
import inspect
import importlib.util

class StrategyModule:
    _registry = {}
    registry_info = {}
    project_root = None
    
    # 注册策略函数
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
        
            # 规范化路径
            func_file_path = os.path.normpath(inspect.getfile(func))
            self_root_normalized = os.path.normpath(cls.project_root)

            # 找到公共路径部分
            common_path = os.path.commonpath([func_file_path, self_root_normalized])

            # 从func_file_path中移除公共路径部分，然后分割剩余路径
            different_path = func_file_path[len(common_path)+1:]  # +1是为了去除路径分隔符
            project = different_path.split(os.path.sep)[0]

            if not project:
                raise ValueError(f"函数{func.__name__}不属于已知的任何项目")
            
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
        
    # 同步策略注册表
    def sync(self, init=False):
        print("--开始同步策略注册表--")
        if not init:
            self.resource_module.sync()
        StrategyModule.project_root = self.resource_module.project_root
        StrategyModule.projects = self.resource_module.projects
        self.register_path = {task: self.resource_module.scan_for_register(task) for task in self.projects}
        for project in self.projects:
            for path in self.register_path[project]:
                self.registry_import(path)
                
        print("==策略注册表同步完成==")
        print(self._registry)

    # 通过文件路径导入模块
    def registry_import(self, path):
        spec = importlib.util.spec_from_file_location(path.split('.')[0].split('\\')[-1], path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    
    # 获取注册表信息
    def get_registry_info(cls):
        return cls.registry_info
    
    # 执行项目
    def execute_project(self,project_name, project, config):
        print(f"--开始执行项目 {project_name}--")
        for task_name, task in project.items():
            print(f"--执行任务 {task_name}")
            self.execute_task(project_name, task, config)
            print(f"==任务 {task_name} 执行完成==")
        print(f"==项目 {project_name} 执行完成==")
    
    # 执行任务
    def execute_task(self,project_name, task, config):
        pre_output = {}
        iter = [0]
        start = 0
        if task["iterator"] == "EN" :
            strategy = task["strategy_queue"][0]
            func_name = strategy["function"]
            id = strategy["id"]
            kwargs = {}
            for args_name, args_value in strategy["args"].items():
                kwargs[args_name] = config[args_value]
            print(f'--执行策略 {id}，策略函数为 {func_name}，参数配置为 {strategy["args"]}，参数为 {kwargs}')
            iter = self.execute_strategy(project_name, func_name, **kwargs)
            print("==得到迭代器对象")
            start = 1
        for i in range(len(iter)):
            for strategy in task["strategy_queue"][start:]:
                id = strategy["id"]
                func_name = strategy["function"]
                kwargs = {}
                for args_name, args_value in strategy["args"].items():
                    pre_strategy_id, _, output_key = args_value.rpartition('_')
                    if output_key == "OUTPUT":
                        kwargs[args_name] = pre_output[pre_strategy_id]
                    elif args_value == "ITER_TERM":
                        kwargs[args_name] = iter[i]
                    else:
                        kwargs[args_name] = config[args_value]
                print(f'--执行策略 {id}，策略函数为 {func_name}，参数配置为 {strategy["args"]}，参数为 {kwargs}')
                pre_output[id] = self.execute_strategy(project_name, func_name, **kwargs)
                print(f"==执行结果为 {pre_output[id]}")

    # 执行策略
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
            raise ValueError(f"项目 {project} 未注册")
        

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
        print("--开始同步资源管理器--")
        self.project_root = os.path.dirname(
                                os.path.dirname(
                                    os.path.dirname(
                                        os.path.abspath(__file__))))
        self.resource_files_path_dict = self.get_resource_files_path()
        self.projects = [list(item.keys())[0] for item in list(self.resource_files_path_dict.values())[0] if isinstance(item, dict) and list(item.keys())[0] != 'CVWEB']
        self.resource_files_path_list = self.restore_paths_from_dict(self.resource_files_path_dict)
        print("==资源管理器同步完成==")
        
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
        print("--开始同步系统配置--")
        self.sys = self.sys_config(self.config_path)
        print("==系统配置同步完成==")
        
    # 同步用户配置文件
    def sync(self, project, user_config_path):
        self.user_config[project] = self.read_config(user_config_path)
        
    # 获取数据库参数
    def get_db_params(self):
        return {
            "dbname": self.sys_config["database"]["db_name"],
            "user": self.sys_config["database"]["db_user"],
            "password": self.sys_config["database"]["db_password"],
            "host": self.sys_config["database"]["db_host"],
            "port": self.sys_config["database"]["db_port"],
        }