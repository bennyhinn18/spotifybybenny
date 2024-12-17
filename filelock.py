import os
import platform

if platform.system() == 'Windows':
    import msvcrt
else:
    import fcntl

class FileLock:
    def __init__(self, file):
        self.file = file
        self.handle = None

    def lock(self):
        if platform.system() == 'Windows':
            self.handle = open(self.file, 'a')
            msvcrt.locking(self.handle.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            self.handle = open(self.file, 'a')
            fcntl.flock(self.handle, fcntl.LOCK_EX | fcntl.LOCK_NB)

    def unlock(self):
        if self.handle:
            if platform.system() == 'Windows':
                msvcrt.locking(self.handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(self.handle, fcntl.LOCK_UN)
            self.handle.close()
            self.handle = None