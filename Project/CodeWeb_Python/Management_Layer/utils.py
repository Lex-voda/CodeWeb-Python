import queue

class CustomOutputStream:
    def __init__(self):
        self._buffer = queue.Queue()

    def write(self, message):
        self._buffer.put(message)

    def flush(self):
        pass  # 标准输出流的 flush 方法通常不需要做任何事情

    def get_value(self):
        return [self._buffer.get() for _ in range(self._buffer.qsize())]

    def clear(self):
        while not self._buffer.empty():
            self._buffer.get()
