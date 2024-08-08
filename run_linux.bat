#!/bin/bash
gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash"
gnome-terminal -- bash -c "your_command_here; exec bash"