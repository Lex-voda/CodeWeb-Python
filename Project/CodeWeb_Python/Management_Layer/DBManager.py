import psycopg2
from functools import wraps

def connect_db_method(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        db_params = self.db_params  # 获取实例的数据库参数
        connection = psycopg2.connect(**db_params)
        cursor = connection.cursor()
        try:
            result = func(self, cursor, *args, **kwargs)  # 将cursor作为第一个参数传递
            connection.commit()
            return result
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()
    return wrapper

class DBManager():
    def __init__(self, db_params):
        self.db_params = db_params
    @connect_db_method
    def get_project_config_path(self, cursor, project_name):
        cursor.execute("SELECT cpath FROM proj_conf WHERE pno = %s", (project_name,))
        result = cursor.fetchone()
        return None if result is None else result[0]
    
    @connect_db_method
    def update_project_config_path(self, cursor, project_name, config_path):
        cursor.execute("UPDATE proj_conf SET cpath = %s WHERE pno = %s", (config_path, project_name))