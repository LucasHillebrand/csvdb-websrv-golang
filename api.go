package main

import (
	"fmt"
	"net/http"
	"strconv"
	cdblib "webAPI/CDBlib"
)

// API backend
func API(req *http.Request, res http.ResponseWriter, DB cdblib.DB, srv *http.Server) {
	URI := req.RequestURI
	SURI := cdblib.Split(URI, "%25")
	URI = ""
	for i := 0; i < len(SURI); i++ {
		URI += SURI[i]
		if i+1 < len(SURI) {
			URI += "%"
		}
	}
	URI = URI[len(APIPath)+1:]
	URL := cdblib.Split(URI, "/")
	if len(URL) > 1 {
		key := DB.SendCmd([]string{"Search", "col", "0", URL[0], "false"})
		ikey, _ := strconv.Atoi(key[0])
		if ikey > 0 {

			res.Write([]byte(ServerRuntime(key[0], URL[1:], DB, srv)))
		}
	}
}

func ServerRuntime(key string, cmd []string, DB cdblib.DB, srv *http.Server) string {
	comd := cmd[0]
	args := make([]string, 0)
	if len(cmd) > 1 {
		args = cdblib.Split(cmd[1], ";")
	}
	class := DB.SendCmd([]string{"Get", "coords", "1:" + key})
	Perm := [][]string{{"PASSTHROUGH", "CREATEKEY", "REMKEY", "LISTKEYS", "GETCLASS", "GETPATH", "STOP"}, {"PASSTHROUGH", "GETCLASS", "GETPATH"}}
	IClass := 1
	switch class[0] {
	case "Admin":
		IClass = 0
	default:
		IClass = 1
	}

	Granted := false
	for i := 0; i < len(Perm[IClass]); i++ {
		if comd == Perm[IClass][i] {
			Granted = true
		}
	}
	out := "err, cmd is wrong or you don't have the Permission to run this command"
	if Granted {
		switch comd {
		case "STOP":
			srv.Shutdown(nil)
		case "LISTKEYS":
			out = DB.SendCmd([]string{"Get", "all"})[0]
		case "GETCLASS":
			out = DB.SendCmd([]string{"Get", "coords", "1:" + key})[0]
		case "REMKEY":
			line := DB.SendCmd([]string{"Search", "col", "0", args[0], "false"})[0]
			if line != "null" {
				DB.SendCmd([]string{"Remove", "row", line})
			}
			out = "SUCCES"
		case "CREATEKEY":
			newKey := Genkey(keylength)
			isThere := "1"
			for isThere != "null" {
				isThere = DB.SendCmd([]string{"Search", "col", "0", newKey})[0]
				if isThere == "null" {
					DB.SendCmd([]string{"Add", "row", newKey + ":" + args[0] + ":" + args[2] + ":" + args[3] + ":" + args[1]})
					out = newKey
				}
			}
		case "PASSTHROUGH":
			permission := permissionDB(args, DB.SendCmd([]string{"Get", "coords", "1:" + key})[0])
			out = ""
			if permission {
				RemotePath := []string{DB.SendCmd([]string{"Get", "coords", "2:" + key})[0], DB.SendCmd([]string{"Get", "coords", "3:" + key})[0]}
				DB.SendCmd([]string{"ChangePath", RemotePath[0], RemotePath[1]})
				RSPath := DB.GetPath()
				outArr := DB.SendCmd(args)
				if DB.GetPath() != RSPath {
					NPath := cdblib.Split(DB.GetPath(), ":")
					DB.SendCmd([]string{"ChangePath", "API", "keys"})
					DB.SendCmd([]string{"Replace", "2:" + key, NPath[0]})
					DB.SendCmd([]string{"Replace", "3:" + key, NPath[1]})
					fmt.Println(NPath, key)
				}

				for i := 0; i < len(outArr); i++ {
					out += outArr[i]
					if i+1 < len(outArr) {
						out += ":"
					}
				}
			} else {
				out = "you don't have the permission to run this call"
			}
		case "GETPATH":
			RemotePath := []string{DB.SendCmd([]string{"Get", "coords", "2:" + key})[0], DB.SendCmd([]string{"Get", "coords", "3:" + key})[0]}
			out = ""
			for i := 0; i < len(RemotePath); i++ {
				out += RemotePath[i]
				if i+1 < len(RemotePath) {
					out += ":"
				}
			}
		}
	}
	return out
}

func permissionDB(cmd []string, class string) bool {
	out := false
	// 0 -> Admin, 1 -> Read, 2 -> Search, 3 -> Write, 4 -> All
	permModel := [][]string{
		{"ChangePath", "Search", "Add", "Replace", "Remove", "Get", "List", "AddDB", "AddTable", "RemoveDB", "RemoveTable", "Stop"},
		{"Search", "Get"},
		{"Search"},
		{"Add"},
		{"Search", "Add", "Replace", "Remove", "Get"}}

	IClass := -1
	switch class {
	case "Admin":
		IClass = 0
	case "Read":
		IClass = 1
	case "Search":
		IClass = 2
	case "Write":
		IClass = 3
	case "All":
		IClass = 4
	}

	if IClass != -1 {
		for i := 0; i < len(permModel[IClass]); i++ {
			if cmd[0] == permModel[IClass][i] {
				out = true
			}
		}
	}

	return out
}
