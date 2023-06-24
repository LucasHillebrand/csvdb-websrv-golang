package main

import (
	"fmt"
	"net/http"
	"strconv"
	cdblib "webAPI/CDBlib"
)

const (
	https       = false
	Port        = 80
	APIPath     = "/API"
	Public      = "./public"
	keylength   = 64
	DatabaseURL = "127.0.0.1:1337"
)

func main() {
	// Check for Database
	DB := cdblib.NewDB(DatabaseURL)
	orgP := cdblib.Split(DB.GetPath(), ":")
	dbs := DB.SendCmd([]string{"List", "dbs"})
	db := false
	for i := 0; i < len(dbs); i++ {
		if dbs[i] == "API" {
			db = true
		}
	}
	if !db {
		DB.SendCmd([]string{"AddDB", "API", "keys", "apikey:class:db:table:note"})
		AddInitUser(*DB, orgP)
	}
	DB.SendCmd([]string{"ChangePath", "API"})
	tables := DB.SendCmd([]string{"List", "tables"})
	table := false
	for i := 0; i < len(tables); i++ {
		if tables[i] == "keys" {
			table = true
		}
	}
	if !table {
		DB.SendCmd([]string{"AddTable", "keys", "apikey:class:db:table:note"})
		AddInitUser(*DB, orgP)
	}
	DB.SendCmd([]string{"ChangePath", "API", "keys"})

	srv := http.Server{Addr: ":" + strconv.Itoa(Port)}
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		Handler(r, w, *DB, &srv)
	})
	srv.Handler = mux

	if https {
		fmt.Println(srv.ListenAndServeTLS("./httpsFiles/cert.pem", "./httpsFiles/key.pem").Error())
	} else if !https {
		fmt.Println(srv.ListenAndServe().Error())
	}
}

func AddInitUser(DB cdblib.DB, Path []string) {
	DB.SendCmd([]string{"ChangePath", "API", "keys"})
	key := Genkey(keylength)
	DB.SendCmd([]string{"Add", "row", key + ":Admin:" + Path[0] + ":" + Path[1] + ":" + cdblib.ConvertStr("Initial user")})
	fmt.Printf("ADMIN API KEY: \"%s\"\n", key)
}
