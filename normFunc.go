package main

import "time"

func Random(heap int) int {
	out := 0

	out = time.Now().Nanosecond() % heap

	return out
}

func Genkey(length int) string {
	out := ""

	Chars := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

	for i := 0; i < length; i++ {
		out += string(Chars[Random(len(Chars))])
	}

	return out
}
