import io
import threading

# 自定义输出流类
class ThreadOutputStream(io.StringIO):
    def __init__(self, emit):
        super().__init__()
        self.lock = threading.Lock()
        self.emit = emit

    def write(self, s):
        with self.lock:
            super().write(s)
            self.emit_func('mission_response', {'message': s, 'data': None})

    def getvalue(self):
        with self.lock:
            return super().getvalue()