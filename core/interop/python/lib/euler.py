#!/usr/bin/env python
# Copyright (c) 2019 Edosa kelvin. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

import json
import struct
import sys
import threading
import Queue

# On Windows, the default I/O mode is O_TEXT. Set this to O_BINARY
# to avoid unwanted modifications of the input/output streams.
if sys.platform == "win32":
    import os
    import msvcrt
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)


################################################################
# IPC helper functions for communincating with the euler host. #
################################################################

def send_message(message):
   # Write message size.
    sys.stdout.write(struct.pack('I', len(message)))
    # Write the message itself.
    sys.stdout.write(message)
    sys.stdout.flush()

def read_message():
    # Read the message length (first 4 bytes).
    text_length_bytes = sys.stdin.read(4)
    if len(text_length_bytes) == 0:
        sys.exit(0)
    # Unpack message length as 4 byte integer.
    text_length = struct.unpack('i', text_length_bytes)[0]
    # Read the text (JSON object) of the message.
    text = sys.stdin.read(text_length).decode('utf-8')
    return text


###############################
# Euler STD wrapper functions #
###############################

def write(text):
    req = {"cmd": "print", "args": [text]}
    send_message(json.dumps(req))
    # read the response back, but discard it
    read_message()


def mean(array):
    request = {"cmd": "mean", "args": [array]}
    send_message(json.dumps(request))
    payload = json.loads(read_message())
    # assert its an array somehow
    return payload["result"]

def table():
    req = {"cmd": "table", "args": []}
    send_message(json.dumps(req))
    res = json.loads(read_message())
