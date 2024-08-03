from flask import Flask, request, jsonify
from flask_cors import CORS

from Management_Layer import ManegementEnd

app = Flask(__name__)
cors = CORS(app, origins="*")

management_instance = ManegementEnd.ManegementEnd()

# 请求同步策略注册表
@app.route('/file/strategy', methods=['GET'])
def get_strategy_registry():
    project_name = request.args.get('project_name')
    if not project_name:
        return jsonify({"error": "Project name is required"}), 400
    try:
        strategy_registry = management_instance.get_strategy_registry(project_name)
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
        directory_tree = management_instance.get_directory_tree()
        return jsonify({"message": "同步成功", "data": {"file_directory": directory_tree}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 501

# 请求项目列表
@app.route('/file/project-list', methods=['GET'])
def get_project_list():
    try:
        project_list = management_instance.get_project_list()
        return jsonify({"message": "同步成功", "data": {"project_list": project_list}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 501

# 请求同步配置文件 !!! 返回值和api没对上
@app.route('/file/config', methods=['GET'])
def get_configuration():
    project_name = request.args.get('project_name')
    if not project_name:
        return jsonify({"error": "Project name is required"}), 400
    try:
        config = management_instance.sync_user_config(project_name)
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
        management_instance.update_user_config(project_name, content)
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
        management_instance.update_folder_or_file([None, file_path, None])
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
        management_instance.update_folder_or_file([file_path, file_path, content])
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 查看文件内容
@app.route('/file', methods=['GET'])
def view_file_content():
    pass

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
        management_instance.update_folder_or_file([file_path, os.path.join(parent_dir, new_name), None])
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
        management_instance.update_folder_or_file([file_path, None, None])
        return jsonify({"message": "Success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 获取任务状态信息
@app.route('/mission', methods=['GET'])
def get_mission_status():
    project_name = request.args.get('project_name')
    if not project_name:
        return jsonify({"error": "Project name is required"}), 400
    try:
        mission_status = management_instance.get_task_status(project_name)
        return jsonify({"message": "Get mission status successfully", "status": mission_status}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 执行任务
@app.route('/mission', methods=['POST'])
def send_mission():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body shouldn't be empty"}), 400
    try:
        response = management_instance.execute(data)
        return jsonify({"message": "Send mission information successfully", "data": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 停止或删除任务
@app.route('/mission', methods=['DELETE'])
def delete_mission():
    mission_name = request.args.get('mission_name')
    if not mission_name:
        return jsonify({"error": "Mission name is required"}), 400
    try:
        management_instance.remove_thread(mission_name)
        return jsonify({"message": "Delete mission successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 获取系统信息
@app.route('/monitor', methods=['GET'])
def get_system_status():
    try:
        system_status = management_instance.get_system_monitor_info()
        return jsonify({"message": "Get system status successfully", "data": system_status}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="localhost", port=8000, debug=True)