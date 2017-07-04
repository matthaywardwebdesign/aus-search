#!/bin/bash
wget -O ./data/gnaf-latest.zip http://data.gov.au/dataset/19432f89-dc3a-4ef3-b943-5326ef1dbecc/resource/99b44dff-4e84-4cb7-9cbf-a68d3ebf964a/download/may17gnafpipeseparatedvalue20170525135436.zip
mkdir ./data/tmp
unzip -o ./data/gnaf-latest.zip -d ./data/tmp
rm -f ./data/*.psv
mv ./data/tmp/FEB17\ GNAF\ PipeSeperatedValue/GNAF/G-NAF\ FEBRUARY\ 2017/Authority\ Code/*.psv ./data/
mv ./data/tmp/FEB17\ GNAF\ PipeSeperatedValue/GNAF/G-NAF\ FEBRUARY\ 2017/Standard/*.psv ./data/
rm -rf ./data/tmp
