class connection{
    INIT(APIKey, APIPath, callback){
        this.key=APIKey
        this.APIPath = APIPath
        this.GETCLASS(callback)
    }
    async GETCLASS(callback){
        let data = await fetch(this.APIPath+"/"+this.key+"/"+"GETCLASS")
        let text = await data.text()
        callback(text)
    }
    async GETPATH(callback){
        let data = await fetch(this.APIPath+"/"+this.key+"/"+"GETPATH")
        let text = await data.text()
        callback(text)
    }
    async LISTKEYS(callback){
        let data = await fetch(this.APIPath+"/"+this.key+"/"+"LISTKEYS")
        let text = await data.text()
        callback(text.split(":"))
    }
    async PASSTHROUGH(command, callback){
        let cmdstr = ""
        for (let i = 0;i<command.length;i++){
            cmdstr+=command[i]
            if (i+1<command.length){
                cmdstr+=";"
            }
        }
        console.log(cmdstr)

        let data = await fetch(this.APIPath+"/"+this.key+"/"+"PASSTHROUGH/"+cmdstr)
        let text = await data.text()
        callback(text.split(":"))
    }
    REMKEY(key){
        fetch(this.APIPath+"/"+this.key+"/"+"REMKEY/"+key)
    }
    
    async GETCLASS(classfication,db,table,Note){
        let data = await fetch(this.APIPath+"/"+this.key+"/"+"CREATEKEY/"+classfication+";"+Note+";"+db+";"+table)
        let text = await data.text()
        callback(text)
    }
}

function toURL(str){
    str+=""
    let out = ""
    
    for (let i=0;i<str.length;i++){
        if (str[i]=="%"){
            out+="%25"
        }else{
            out+=str[i]
        }
    }

    return out
}


function convert(org){
    let out = ""
    org+=""

    for (let i=0;i<org.length;i++){
        
            switch (org[i]){
                case ",":
                    out+="%k*"
                    break
                case ":":
                    out+="%d*"
                    break
                case ";":
                    out+="%s*"
                    break
                case "%":
                    out+="%%*"
                    break
                case "\"":
                    out+="%A*"
                    break
                case "*":
                    out+="%**"
                    break
                case " ":
                    out+="%c*"
                    break
                case "\n":
                    out+="%n*"
                    break
                default:
                    out+=org[i]
            }
    }

    return out
}

function deconvert(str){
    let out=""
    for (let i=0;i<str.length;i++){
        if (str[i]=="%"){
            switch (getNextChars(str,i,3)){
                case "%k*":
                    out+=","
                    break
                case "%d*":
                    out+=":"
                    break
                case "%s*":
                    out+=";"
                    break
                case "%%*":
                    out +="%"
                    break
                case "%A*":
                    out+="\""
                    break
                case "%**":
                    out+="*"
                    break
                case "%c*":
                    out+=" "
                    break
                case "%n*":
                    out+="\n"
                    break
                default:
                    out+=str[i]
                    i-=2
                    break
            }
            i+=2
        }else{
            out+=str[i]
        }
    }
    return out
}

function getNextChars(str,start,len){
    let out = ""

    for (let i=start;i<start+len && i<str.length;i++){
        out+=str[i]
    }

    return out
}

function printout(text){
    console.log(text)
}