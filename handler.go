package main

import (
	"fmt"
	"net/http"
	"os"
	cdblib "webAPI/CDBlib"
)

func Handler(req *http.Request, res http.ResponseWriter, DB cdblib.DB, srv *http.Server) {

	if len(req.RequestURI) >= len(APIPath)+1 && req.RequestURI[0:len(APIPath)] == APIPath {
		API(req, res, DB, srv)
	} else {
		GetFile(req, res)
	}
}

// Normal webserver
func GetFile(req *http.Request, res http.ResponseWriter) {
	URL := req.RequestURI
	fmt.Println(URL)
	if URL[len(URL)-1] == '/' {
		URL += "index.html"
	}
	file, err := os.ReadFile(Public + URL)
	if err == nil {
		res.Write(file)
	} else {
		res.Write([]byte(err.Error()))
	}
}
