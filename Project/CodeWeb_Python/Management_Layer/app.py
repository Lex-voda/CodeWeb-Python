from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import sys

from ManagementEnd import ManagementEnd
from utils import CustomOutputStream

app = Flask(__name__)
cors = CORS(app, origins="*")
socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins="*")

manager = ManagementEnd()

# 请求同步策略注册表
@app.route('/file/strategy', methods=['GET'])
def get_strategy_registry():
    project_name = request.args.get('project_name')
    if not project_name:
        return jsonify({"error": "Project name is required"}), 400
    try:
        strategy_registry = manager.get_strategy_registry(project_name)
        return jsonify({"message": "同步成功", "data": {"strategy_registry": strategy_registry}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 501

# 请求同步项目文件目录
@app.route('/file/directory', methods=['GET'])
def get_directory_tree():
    project_name = request.args.get('project_name')
    if not project_name:
        return jsonify({"error": "Project name is required"}), 400
    try:
        directory_tree = manager.get_directory_tree(project_name)
        print(directory_tree)
        return jsonify({"message": "同步成功", "data": {"file_directory": directory_tree}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 501

# 请求项目列表
@app.route('/file/project-list', methods=['GET'])
def get_project_list():
    try:
        project_list = manager.get_project_list()
        return jsonify({"message": "同步成功", "data": {"project_list": project_list}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 501

# 请求同步配置文件
@app.route('/file/config', methods=['GET'])
def get_configuration():
    project_name = request.args.get('project_name')
    if not project_name:
        return jsonify({"error": "Project name is required"}), 400
    try:
        config = manager.sync_user_config(project_name)
        return jsonify({"message": "Sync succeed", "data": {"configuration": config}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 501

# 发送修改后的配置表单
@app.route('/file/config', methods=['PUT'])
def update_configuration():
    data = request.get_json()
    project_name = request.args.get('project_name')
    content = data.get('content')
    if not project_name or not content:
        return jsonify({"error": "Project name and content are required"}), 400
    try:
        manager.update_user_config(project_name, content)
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 创建文件或文件夹
@app.route('/file', methods=['POST'])
def create_file():
    file_path = request.args.get('file_path')
    if not file_path:
        return jsonify({"error": "File path is required"}), 400
    try:
        manager.update_folder_or_file([None, file_path, None])
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 修改文件内容
@app.route('/file', methods=['PUT'])
def modify_file():
    data = request.get_json()
    file_path = request.args.get('file_path')
    content = data.get('content')
    if not file_path or not content:
        return jsonify({"error": "File path and content are required"}), 400
    try:
        manager.update_folder_or_file([file_path, file_path, content])
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 查看文件内容
@app.route('/file', methods=['GET'])
def view_file_content():
    file_path = request.args.get('file_path')
    print(file_path)
    if not file_path:
        return jsonify({"error": "File path is required"}), 400
    try:
        content = manager.read_file(file_path)
        return jsonify({"message": "Success", "data": {"content": content}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 重命名用户文件
@app.route('/file', methods=['PATCH'])
def rename_file():
    file_path = request.args.get('file_path')
    new_name = request.get_data(as_text=True)
    if not file_path or not new_name:
        return jsonify({"error": "File path and new name are required"}), 400
    import os
    parent_dir = os.path.dirname(file_path)
    try:
        manager.update_folder_or_file([file_path, os.path.join(parent_dir, new_name), None])
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 删除用户文件
@app.route('/file', methods=['DELETE'])
def delete_file():
    file_path = request.args.get('file_path')
    if not file_path:
        return jsonify({"error": "File path is required"}), 400
    try:
        manager.update_folder_or_file([file_path, None, None])
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 执行任务
@socketio.on('send_mission')
def handle_send_mission(data):
    print(data)
    
    if not data:
        emit('mission_response', {"error": "Request body shouldn't be empty"})
        return
    
    try:
        custom_output = CustomOutputStream()
        sys.stdout = custom_output
        
        response = manager.execute(data)
        
        sys.stdout = sys.__stdout__
        print("任务执行完成")
        emit('mission_response', {"message": custom_output.get_value(), "data": response,"status":False})
        
    except Exception as e:
        emit('mission_response', {"error": str(e)})
        

# 停止或删除任务
@app.route('/mission', methods=['DELETE'])
def delete_mission():
    print(request.args)
    project_name = request.args.get('project_name')
    if not project_name:
        return jsonify({"error": "Project name is required"}), 400
    try:
        manager.remove_thread(project_name)
        return jsonify({"message": "Delete mission successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 获取系统信息
@app.route('/monitor', methods=['GET'])
def get_system_status():
    try:
        system_status = manager.get_system_monitor_info()
        print(system_status)
        return jsonify({"message": "Get system status successfully", "data": system_status}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    socketio.run(app, host="localhost", port=8000, debug=True)