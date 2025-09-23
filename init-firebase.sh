#!/bin/bash

# Firebase init script for database
cat << EOF | firebase init database
database.rules.json
Y
asia-southeast1
N
EOF