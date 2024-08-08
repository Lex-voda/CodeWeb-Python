import os
import re
import sys
import json
import time
import threading
import queue
import inspect
import importlib.util
import clr 

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
            cls.registry_info[project][name] = {"argus": [{"argu_name":param.name, "argu_annotation":str(param.annotation), "argu_default":str(param.default)} for param in signature.parameters.values()], "return_annotation": str(return_annotation), "comment": comment}
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
                self._registry_import(path)
                
        print("==策略注册表同步完成==")
        print(self._registry)
        print(self.registry_info)

    # 通过文件路径导入模块
    def _registry_import(self, path):
        spec = importlib.util.spec_from_file_location(path.split('.')[0].split('\\')[-1], path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    
    # 获取注册表信息
    def get_registry_info(cls, project_name):
        if project_name in cls.registry_info:
            return cls.registry_info[project_name]
        elif project_name is None:
            return cls.registry
        else:
            raise ValueError(f"项目 {project_name} 未注册")
    
    # 执行项目
    def execute_project(self,project_name, project, config):
        print(f"--开始执行项目 {project_name}--")
        for task_name, task in project.items():
            print(f"--执行任务 {task_name}")
            output_data = self._execute_task(project_name, task, config)
            print(f"==任务 {task_name} 执行完成==")
        print(f"==项目 {project_name} 执行完成==")
        print(output_data)
        return output_data
    
    # 执行任务
    def _execute_task(self,project_name, task, config):
        pre_output = {}
        iter = [0]
        start = 0
        if task["ITER"] == True :
            strategy = task["STRATEGY_QUEUE"][0]
            func_name = strategy["FUNC"]
            id = strategy["ID"]
            kwargs = {}
            for args_name, args_value in strategy["ARGS"].items():
                kwargs[args_name] = config[args_value]
            print(f'--执行策略 {id}，策略函数为 {func_name}，参数配置为 {strategy["ARGS"]}，参数为 {kwargs}')
            iter = self.__execute_strategy(project_name, func_name, **kwargs)
            print("==得到迭代器对象")
            start = 1
        for i in range(len(iter)):
            for strategy in task["STRATEGY_QUEUE"][start:]:
                id = strategy["ID"]
                func_name = strategy["FUNC"]
                kwargs = {}
                for args_name, args_value in strategy["ARGS"].items():
                    print(args_value)
                    pre_strategy_id, _, output_key = args_value.rpartition('_')
                    if output_key == "OUTPUT":
                        kwargs[args_name] = pre_output[pre_strategy_id]
                    elif args_value == "ITER_TERM":
                        kwargs[args_name] = iter[i]
                    else:
                        kwargs[args_name] = config[args_value]
                print(f'--执行策略 {id}，策略函数为 {func_name}，参数配置为 {strategy["ARGS"]}，参数为 {kwargs}')
                pre_output[id] = self.__execute_strategy(project_name, func_name, **kwargs)
                
        return {strategy_id: pre_output.get(strategy_id) for strategy_id in task['GET_OUTPUT']}

    # 执行策略
    def __execute_strategy(self, project, name, *args, **kwargs):
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
    def __init__(self,sys_name, ignore_prefixes=None, ignore_suffixes=None):
        
        self.project_root = None    # 项目根目录的绝对路径
        self.root_project = None    # 项目根目录的文件夹名
        self.directory_tree = None
        self.projects = None
        
        self.ignore_prefixes = ignore_prefixes if ignore_prefixes else [] # 忽略的文件夹前缀
        self.ignore_suffixes = ignore_suffixes if ignore_suffixes else [] # 忽略的文件后缀
        self.sys_name = sys_name
        self.sync()
        
        # 系统资源监控
        self.monitor_queue = queue.Queue()
        
        lib_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bin", "OpenHardwareMonitorLib")
        clr.AddReference(lib_path)
        from OpenHardwareMonitor.Hardware import Computer 
        self.compute = Computer()
        self.compute.CPUEnabled = True
        self.compute.GPUEnabled = True 
        self.compute.HDDEnabled = True
        self.compute.RAMEnabled = True 
        self.compute.Open()
        
    def sync(self):
        print("--开始同步资源管理器--")
        self.project_root = os.path.dirname(
                                os.path.dirname(
                                    os.path.dirname(
                                        os.path.abspath(__file__))))
        self.root_project = os.path.basename(self.project_root)
        self.directory_tree = self.get_directory_tree()
        self.projects = [list(item.keys())[0] for item in list(self.directory_tree.values())[0] if isinstance(item, dict) and list(item.keys())[0] != self.sys_name]
        self.resource_files_path_list = self.restore_paths_from_dict(self.directory_tree)
        print("==资源管理器同步完成==")
        
    def get_directory_tree(self):
        # 获取项目根目录下的所有文件和文件夹
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
    
    def update_folder_or_file(self, past_new_path_content):
        past, new, content = past_new_path_content
        past_abs = self._get_absolute_path(past)
        new_abs = self._get_absolute_path(new)

        if past and new:
            # 重命名文件或文件夹
            if os.path.exists(past_abs):
                os.rename(past_abs, new_abs)
                # 如果是文件且提供了内容，则修改文件内容
                if os.path.isfile(new_abs) and content is not None:
                    with open(new_abs, 'w') as f:
                        f.write(content)
            else:
                print(f"Error: {past_abs} does not exist.")
        elif past and not new:
            # 删除文件或文件夹
            if os.path.isdir(past_abs):
                os.rmdir(past_abs)
            elif os.path.isfile(past_abs):
                os.remove(past_abs)
            else:
                print(f"Error: {past_abs} does not exist.")
        elif not past and new:
            # 创建文件或文件夹
            if new.endswith('/'):
                os.makedirs(new_abs, exist_ok=True)
            else:
                with open(new_abs, 'w') as f:
                    f.write(content if content is not None else '')
        else:
            print("Error: Both past and new cannot be empty.")
    
    def get_file_content(self, file_path):
        file_path = self._get_absolute_path(file_path)
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
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
    
    def get_system_resources(self):
        """
        获取系统资源信息
        """
        # CPU
        cpu_load = [self.compute.Hardware[0].Sensors[a].get_Value() for a in range(len(self.compute.Hardware[0].Sensors)) if '/load' in str(self.compute.Hardware[0].Sensors[a].Identifier) and self.compute.Hardware[0].Sensors[a].get_Value() is not None]
        cpu_temp = [self.compute.Hardware[0].Sensors[a].get_Value() for a in range(len(self.compute.Hardware[0].Sensors)) if '/temperature' in str(self.compute.Hardware[0].Sensors[a].Identifier) and self.compute.Hardware[0].Sensors[a].get_Value() is not None]
        cpu_power = [self.compute.Hardware[0].Sensors[a].get_Value() for a in range(len(self.compute.Hardware[0].Sensors)) if '/power' in str(self.compute.Hardware[0].Sensors[a].Identifier) and self.compute.Hardware[0].Sensors[a].get_Value() is not None]
        
        cpu_load = round(sum(cpu_load) / len(cpu_load),2) if len(cpu_load) > 0 else None
        cpu_temp = round(sum(cpu_temp) / len(cpu_temp),2) if len(cpu_temp) > 0 else None
        cpu_power = round(sum(cpu_power) / len(cpu_power),2) if len(cpu_power) > 0 else None

        # RAM
        ram_load = [self.compute.Hardware[1].Sensors[a].get_Value() for a in range(len(self.compute.Hardware[1].Sensors)) if '/load' in str(self.compute.Hardware[1].Sensors[a].Identifier) and self.compute.Hardware[1].Sensors[a].get_Value() is not None]
        
        ram_load = round(sum(ram_load) / len(ram_load),2)if len(ram_load) > 0 else None

        # GPU
        gpu_load = [self.compute.Hardware[2].Sensors[a].get_Value() for a in range(len(self.compute.Hardware[2].Sensors)) if '/load' in str(self.compute.Hardware[2].Sensors[a].Identifier) and self.compute.Hardware[2].Sensors[a].get_Value() is not None]
        gpu_temp = [self.compute.Hardware[2].Sensors[a].get_Value() for a in range(len(self.compute.Hardware[2].Sensors)) if '/temperature' in str(self.compute.Hardware[2].Sensors[a].Identifier) and self.compute.Hardware[2].Sensors[a].get_Value() is not None]
        gpu_power = [self.compute.Hardware[2].Sensors[a].get_Value() for a in range(len(self.compute.Hardware[2].Sensors)) if '/power' in str(self.compute.Hardware[2].Sensors[a].Identifier) and self.compute.Hardware[2].Sensors[a].get_Value() is not None]
        
        gpu_load = round(sum(gpu_load) / len(gpu_load),2) if len(gpu_load) > 0 else None
        gpu_temp = round(sum(gpu_temp) / len(gpu_temp),2) if len(gpu_temp) > 0 else None
        gpu_power = round(sum(gpu_power) / len(gpu_power),2) if len(gpu_power) > 0 else None

        # HDD
        hdd_load = [self.compute.Hardware[3].Sensors[a].get_Value() for a in range(len(self.compute.Hardware[3].Sensors)) if '/load' in str(self.compute.Hardware[3].Sensors[a].Identifier) and self.compute.Hardware[3].Sensors[a].get_Value() is not None]
        hdd_load = round(sum(hdd_load) / len(hdd_load),2) if len(hdd_load) > 0 else None
        
        for header in self.compute.Hardware:
            header.Update()
        
        return {
            "CPU": {
                "load": cpu_load,
                "temperature": cpu_temp,
                "power": cpu_power
            },
            "RAM": {
                "load": ram_load
            },
            "GPU": {
                "load": gpu_load,
                "temperature": gpu_temp,
                "power": gpu_power
            },
            "HDD": {
                "load": hdd_load
            }
        }
    
    def _get_absolute_path(self, relative_path):
        if relative_path:
            if relative_path.startswith('/'):
                relative_path = relative_path[1:]
            print(self.project_root)
            print(os.path.normpath(os.path.join(self.project_root, relative_path)))
            return os.path.normpath(os.path.join(self.project_root, relative_path))
        return None

        
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

    def write_config(self, path, content):
        if os.path.exists(path):
            with open(path, 'w', encoding='utf-8') as file:
                json.dump(content, file, ensure_ascii=False, indent=4)
        else:
            raise ValueError(f"配置文件不存在:{path}")

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