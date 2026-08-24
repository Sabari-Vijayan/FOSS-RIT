---
name: "GoTodo"
description: "A lightweight command-line Todo application written in Go with persistent JSON storage and Linux AppImage support."
repo_url: "https://github.com/callmekriztal/Go_Todo"
tech_stack: ["Go", "JSON", "Linux", "AppImage"]
author: "callmekriztal"
author_name: "Christy Cyril"
is_verified_student: true
batch: "2026"
featured: true
---

### About the Project

GoTodo is a lightweight command-line Todo List application built with Go. It allows users to add, edit, delete, list, complete, and clear tasks directly from the terminal.

Tasks are persisted locally in JSON format at `~/.todocli/todos.json`, so they remain available between runs without requiring a database or external service.

The project includes input validation, error handling, unit tests, and Linux distribution through both a standalone binary and an AppImage.

### Features

- Add and edit tasks
- Delete tasks
- Toggle task completion
- Clear the entire task list
- Display tasks in a formatted terminal table
- Persistent local JSON storage
- Creation and completion timestamps
- Unit tests
- Linux AppImage distribution
