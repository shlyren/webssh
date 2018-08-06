#!/usr/bin/env bash
# Linux platform bash file


sudo python setup.py install

wssh --log-file-prefix=main.log &
