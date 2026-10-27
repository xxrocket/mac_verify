package main

import (
	"fmt"
	"runtime"
)

func main() {
	fmt.Println("Hello, World from Go!")
	fmt.Printf("GOOS=%s GOARCH=%s %s\n", runtime.GOOS, runtime.GOARCH, runtime.Version())
}
