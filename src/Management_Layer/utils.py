import io
import threading

# 自定义输出流类
class ThreadOutputStream(io.StringIO):
    def __init__(self):
        super().__init__()
        self.lock = threading.Lock()

    def write(self, s):
        with self.lock:
            super().write(s)

    def getvalue(self):
        with self.lock:
            return super().getvalue()