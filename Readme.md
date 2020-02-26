# ECAL / M.I.T. HUB

**“Explore networked communication in an art and design context”**   
Here is the technical instructions to build a master hub connecting several tangible (or web based) inputs/outputs.

# Part 1 : Rapsberry (master)
To be able to listen to Firebase Event, we need to install Python3 on the Rapsberry PI. (If not already)   
[Original detailed process](https://gist.github.com/SeppPenner/6a5a30ebc8f79936fa136c524417761d) 
```sh
sudo apt-get update -y
sudo apt-get install build-essential tk-dev libncurses5-dev libncursesw5-dev libreadline6-dev libdb5.3-dev libgdbm-dev libsqlite3-dev libssl-dev libbz2-dev libexpat1-dev liblzma-dev zlib1g-dev libffi-dev -y
```
```sh
wget https://www.python.org/ftp/python/3.7.4/Python-3.7.4.tar.xz
tar xf Python-3.7.4.tar.xz
cd Python-3.7.4
./configure
make -j 4
sudo make altinstall
```
To separate previous python installation, we'll use a virtual environment.  
To be able to install a virtual environment we'll use the package installer pip.
```sh
sudo apt install python3-pip
sudo pip3 install virtualenv 
virtualenv env3 -p /usr/bin/python3
source env3/bin/activate
```
Install all requirements within that new virtualenv.
```sh
pip install -r requirements.txt
```
Run the python script for the master. It should connect to the `n` I2C subordinates and listen for Firebase events.  
> [The original firebase streaming](https://github.com/andrewsosa/firebase-python-streaming) by Andrew Sosa
```sh
cd pythonFolder
python master.py
```

Following that idea to keep all connection as simple as possible, we propose to use a minimal amount of GPIO pin to connect the I2C network. In that example :  
* GPIO 02
* GPIO 03  
* Ground  
<img width="908" alt="Capture d’écran 2020-01-29 à 23 19 03" src="https://user-images.githubusercontent.com/5444221/73402688-22b29500-42ee-11ea-9905-94bb3b0cd77a.png">

To check if i2c adress is set : i2cdetect -y 1

# Part 2 : Arduino (slave)
W.I.P
# Part 3 : Firebase (connector)
W.I.P
# Part 4 : Web based app
W.I.P
# Part 5 : Routing Editor
W.I.P
