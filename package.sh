#!/bin/bash

rm TheBigDashboardski.zip
zip -r --exclude=*.git* --exclude=*node_modules* --exclude=*src* TheBigDashboardski.zip .
