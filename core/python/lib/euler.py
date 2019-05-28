import euler_interop

# Euler library wrappers
def write(text):
    euler_interop.send_message('{"cmd": "print", "args": "%s" }'% text)
    euler_interop.read_message()