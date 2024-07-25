
# 自定义输出流类
class ThreadOutputStream:
    def __init__(self):
        self.contents = []

    def write(self, text):
        self.contents.append(text)

    def flush(self):
        pass