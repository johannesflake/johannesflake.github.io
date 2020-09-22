#!/bin/sh

encodedFont=`base64 -w 0 $2`
echo "@font-face{font-family:'$1';src:url(data:font/ttf;base64,$encodedFont) format('truetype');}"