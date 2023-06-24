package cdblib

import (
	"fmt"
	"net"
)

func ConvertStr(str string) string {
	out := ""
	for i := 0; i < len(str); i++ {
		switch str[i] {
		case ',':
			out += "%k*"
		case ':':
			out += "%d*"
		case ';':
			out += "%s*"
		case '%':
			out += "%%*"
		case '"':
			out += "%A*"
		case '*':
			out += "%**"
		case ' ':
			out += "%c*"
		case '\n':
			out += "%n*"
		default:
			out += string(str[i])
		}
	}
	return out
}

func DeconvertStr(str string) string {
	out := ""
	for i := 0; i < len(str); i++ {
		if str[i] == '%' {
			switch NextChars(str, i, 3) {
			case "%k*":
				out += ","
			case "%d*":
				out += ":"
			case "%s*":
				out += ";"
			case "%%*":
				out += "%"
			case "%A*":
				out += "\""
			case "%**":
				out += "*"
			case "%c*":
				out += " "
			case "%n*":
				out += "\n"
			default:
				out += string(str[i])
				i -= 2
			}
			i += 2
		} else {
			out += string(str[i])
		}
	}
	return out
}

type DB struct {
	server string
	path   string
}

func NewDB(server string) *DB {
	out := DB{
		server: server,
		path:   "-1:-1",
	}
	conn, err := net.Dial("tcp", server)
	if err == nil {
		fmt.Println(out.InternRuntime(out.GetStr(conn)))
		conn.Close()
	}
	return &out
}

func Send(conn net.Conn, str string) {
	size := len(str)
	bytes := UintToBytes(uint64(size))
	conn.Write(bytes)
	conn.Write(toBytes(str))
}
func (itSlef *DB) InternRuntime(inp string) []string {
	out := make([]string, 1)
	args := Split(inp, ";")
	cmd := Split(args[0], ":")

	switch cmd[0] {
	case "NEWP":
		itSlef.path = cmd[1] + ":" + cmd[2]
	case "ERROR":
		out = []string{"error", cmd[1]}
	case "FORMAT":
		out = Split(args[1], ":")
		if len(out) >= 2 {
			out = out[1:]
		} else {
			out[0] = "null"
		}
	case "CSV":
		out[0] = args[1]
	}

	if out[0] == "" && len(args) >= 2 {
		out[0] = args[1]
	}

	return out
}

func (itSlef *DB) GetStr(conn net.Conn) string {
	sizebuf := make([]byte, 8)
	conn.Read(sizebuf)
	size := ByteToUint(sizebuf)
	buf := make([]byte, size)
	conn.Read(buf)
	out := ""
	for i := 0; i < len(buf); i++ {
		out += string(buf[i])
	}
	return out
}

func (itSelf *DB) SendCmd(cmd []string) []string {
	out := make([]string, 1)
	cmdstr := itSelf.path
	for i := 0; i < len(cmd); i++ {
		cmdstr += ";" + cmd[i]
	}
	conn, err := net.Dial("tcp", itSelf.server)
	if err == nil {
		Send(conn, cmdstr)
		out = itSelf.InternRuntime(itSelf.GetStr(conn))
	} else {
		out[0] = "connection refused"
	}
	return out
}

func (itSelf *DB) GetPath() string {
	return itSelf.path
}
