# 测试项目
from CodeWeb_Python.api import StrategyModule as Strategy
from PIL import Image
from io import BytesIO
import base64
import os

class IterNum:
    def __init__(self, num):
        self.num = num
        self.arr = list(range(num))

    def __getitem__(self, index):
        return self.arr[index]

    def __len__(self):
        return self.num



@Strategy.register(name="add", comment="Add two numbers")
def add_numbers(a, b):
    return a + b

@Strategy.register(name="sub", comment="Subtract two numbers")
def subtract_numbers(a, b):
    return a - b

@Strategy.register(name="iter", comment="get an iterator")
def get_iter(num):
    return IterNum(num)

@Strategy.register(name="image_to_base64", comment="Convert image to base64")
def image_to_base64(image_path):
    """
    读取图片文件并将其转换为Base64编码的字符串

    :param image_path: 图片文件的路径
    :return: Base64编码的字符串
    """
    script_dir = os.path.dirname(__file__)
    # 构建图片的相对路径
    image_path = os.path.join(script_dir, image_path)
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"文件 {image_path} 不存在")

    # 打开图片并缩小
    with Image.open(image_path) as img:
        # 获取原始尺寸
        original_width, original_height = img.size
        # 计算缩小后的尺寸
        new_width = original_width // 2
        new_height = original_height // 2
        # 缩小图片
        img = img.resize((new_width, new_height), Image.LANCZOS)

        # 将缩小后的图片保存到内存中
        buffered = BytesIO()
        img.save(buffered, format="JPEG")
        image_data = buffered.getvalue()

    # 将图片数据编码为Base64
    base64_encoded = base64.b64encode(image_data).decode('utf-8')
    return 'data:image/jpeg;base64,'+base64_encoded