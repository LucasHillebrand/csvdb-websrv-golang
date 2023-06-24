let conn

function ChangeWindow(window){
    const APIMan = document.getElementById("APIMan")
    const DBMan = document.getElementById("DBMan")
    const Login = document.getElementById("Login")
    
    switch (window){
        case "APIMan":
            DBMan.hidden=true
            Login.hidden=true
            APIMan.hidden=false
            break
        case "DBMan":
            DBMan.hidden=false
            Login.hidden=true
            APIMan.hidden=true
            break
        case "Login":
            DBMan.hidden=true
            Login.hidden=false
            APIMan.hidden=true
            break
    }
}

function Login(){
    let key = document.getElementById("APIKEY").value
    conn = new connection
    conn.INIT(key,"/API",(text)=>{if (text == "Admin"){ChangeWindow("DBMan")}else{document.getElementById("APIKEY").value="";alert("you don't have Admin Permission level")}})
    reload()
}

function reload(){
    document.getElementById("jsSearch").innerHTML=""
    conn.GETPATH((path)=>{
        let spath = path.split(":")
        conn.PASSTHROUGH(["List","dbs"],(res)=>{
            let str = "<ul>"
            for (let i=0;i<res.length;i++){
                str+="<li class=\""+res[i]+"\"><a onclick=\"conn.PASSTHROUGH(['ChangePath','"+res[i]+"'],(none)=>{reload()})\">"
                str+=res[i]
                str+="</a></li>"
            }
            str+="</ul>"
            document.getElementById("DBs").innerHTML=str
        })
        if (spath[0]!="-1"){
            conn.PASSTHROUGH(["List","tables"],(res)=>{
                let str = "<ul>"
            for (let i=0;i<res.length;i++){
                str+="<li class=\""+res[i]+"\"><a onclick=\"conn.PASSTHROUGH(['ChangePath','"+spath[0]+"','"+res[i]+"'],(none)=>{reload()})\">"
                str+=res[i]
                str+="</a></li>"
            }
            str+="</ul>"
                document.getElementById("tables").innerHTML=str
            })
        }
        if (spath[1]!="-1"){
            conn.PASSTHROUGH(["Get","all"],(res)=>{
                let text=res[0]
                let rows = text.split("\n")
                let table = []
                for (let i = 0;i<rows.length;i++){
                    table.push(rows[i].split(","))
                }
                let str="<table>"
                for (let i=0;i<table.length;i++){
                    str+="<tr class=\"row_"+i+"\">"
                    for (let j=0;j<table[i].length;j++){
                        str+="<td class=\"col_"+j+"\">"
                        str+="<a onclick=\"setCoords("+j+","+i+")\">"
                        str+=deconvert(table[i][j])
                        str+="</a>"
                        str+="</td>"
                    }
                    str+="</tr>"
                }
                document.getElementById("tableBox").innerHTML=str
            })
        }else{
            document.getElementById("tableBox").innerHTML=""
        }
        let style=""
        if (spath[0]!="API"){
        if (spath[0]!="-1"){
            style+=".DBMan .top .DBs_Tables ."+spath[0]+"{background-color:#cccccc;}"
        }
        if (spath[1]!="-1"){
            style+=".DBMan .top .DBs_Tables ."+spath[1]+"{background-color:#cccccc;}"
        }}else{
            if (spath[0]!="-1"){
                style+=".DBMan .top .DBs_Tables ."+spath[0]+"{background-color:#cc0000;}"
            }
            if (spath[1]!="-1"){
                style+=".DBMan .top .DBs_Tables ."+spath[1]+"{background-color:#cc0000;}"
            }
        }
        document.getElementById("jsSelectStyle").innerHTML=style
    })
}

function setCoords(col, row){
    document.getElementById("middle_val").innerHTML=col+":"+row
}

function createInputs(placeholders, ids, funcstr, name){
    if (placeholders.length != ids.length){
        return
    }
    let inputs=""
    for (let i = 0;i<placeholders.length;i++){
        inputs+="<input type=\"text\" placeholder=\""+placeholders[i]+"\" id=\""+ids[i]+"\">"
    }
    document.getElementById("middle_input").innerHTML=inputs
    document.getElementById("middle_submit").innerHTML="<input type=\"submit\" value=\""+name+"\" onclick=\""+funcstr+"\">"
    style=""
    style+=".DBMan .middle .main input{border:0;height:100%;width:"+100/placeholders.length+"%;}"
    style+=".DBMan .middle .opt .submit input{border:0;height:100%;width:100%;}"
    document.getElementById("jsInputStyle").innerHTML=style
}

function split(org,keystr){
    let out = []
    let tmpstr=""
    let A = false
    for (let i=0;i<org.length;i++){
        if (getNextChars(org,i,keystr.length) == keystr && !A){
            out.push(tmpstr)
            tmpstr=""
            i+=keystr.length-1
        }else if (org[i]=="\""){
            A=!A
        }else{
            tmpstr+=org[i]
        }
    }
    out.push(tmpstr)
    return out
}

function Usplit(org,keystr){
    let out = []
    let tmpstr=""
    let A = false
    for (let i=0;i<org.length;i++){
        if (getNextChars(org,i,keystr.length) == keystr && !A){
            out.push(tmpstr)
            tmpstr=""
            i+=keystr.length-1
        }else if (org[i]=="\""){
            A=!A
        }else if (!A){
            tmpstr+=org[i]
        }else{
            tmpstr+=toURL(convert(org[i]))
        }
    }
    out.push(tmpstr)
    return out
}

function AddDB(mode){
    if (mode=="prev"){
        createInputs(["name","tableName","inital values seperated by: [space]"],["DBName","DBTableName","DBHeader"],"AddDB('run')","submit")
    }else{
        let values = []
        values.push(document.getElementById("DBName").value)
        values.push(document.getElementById("DBTableName").value)
        values.push(document.getElementById("DBHeader").value)
        voidinp()
        header=split(values[2]," ")
        let headerstr=""
        for (let i=0;i<header.length;i++){
            headerstr+=convert(header[i])
            if (i+1<header.length){
                headerstr+=":"
            }
        }
        //console.log(headerstr)
        conn.PASSTHROUGH(["AddDB",values[0],values[1],toURL(headerstr)],(val)=>{})
        reload()
    }
}

function voidinp(){
    createInputs([],[],"// void","void")
}

function RemoveDB(mode){
    if (mode == "prev"){
        createInputs(["DatabaseName"],["DBName"],"RemoveDB('run')","submit")
    }else{
        let value=document.getElementById("DBName").value
        conn.PASSTHROUGH(["RemoveDB",value],(none)=>{})
        voidinp()
        reload()
    }
}

function AddTable(mode){
    if (mode == "prev"){
        createInputs(["TableName","inital values seperated by: [space]"],["TableName","TableHeader"],"AddTable('run')","submit")
    }else{
        let values = []
        values.push(document.getElementById("TableName").value)
        values.push(document.getElementById("TableHeader").value)
        voidinp()
        header=split(values[1]," ")
        let headerstr=""
        for (let i=0;i<header.length;i++){
            headerstr+=convert(header[i])
            if (i+1<header.length){
                headerstr+=":"
            }
        }
        conn.PASSTHROUGH(["AddTable",values[0],toURL(headerstr)],(none)=>{})
        reload()
    }
}

function RemoveTable(mode){
    if (mode == "prev"){
        createInputs(["TableName"],["TableName"],"RemoveTable('run')","submit")
    }else{
        let value=document.getElementById("TableName").value
        conn.PASSTHROUGH(["RemoveTable",value],(none)=>{})
        voidinp()
        reload()
    }
}

function Add(mode){
    if (mode[1] == "prev"){
        if (mode[0]=="row"){
            conn.PASSTHROUGH(["Get","row","0"],(row)=>{
                let ids=[]
                for (let i=0;i<row.length;i++){
                    ids.push("AddRowID_"+i)
                }
                createInputs(row,ids,"Add(['row','run'])","submit")
            })
        }else if(mode[0]=="col"){
            createInputs(["title","default Value"],["AddTitle","AddDef"],"Add(['col','run'])","submit")
        }
    }else{
        if (mode[0]=="row"){
            conn.PASSTHROUGH(["Get","row","0"],(row)=>{
                let ids=[]
                for (let i=0;i<row.length;i++){
                    ids.push("AddRowID_"+i)
                }
                let asStr = []
                for (let i=0;i<row.length;i++){
                    asStr += convert(document.getElementById(ids[i]).value)
                    if (i+1<row.length){
                        asStr += ":"
                    }
                }
                voidinp()


                conn.PASSTHROUGH(["Add","row",toURL(asStr)],(none)=>{})
                reload()
            })
        }else if (mode[0]=="col"){
            let values = []
            values.push(convert(document.getElementById("AddTitle").value))
            values.push(convert(document.getElementById("AddDef").value))
            voidinp()
            conn.PASSTHROUGH(["Add","col",toURL(values[0]+":"+values[1])],(none)=>{})
            reload()
        }
    }
}

function Search(mode){
    let CR=mode[0]
    if (mode[1]=="prev"){
        createInputs(["Keyword"],["SearchKeyword"],"Search(['"+CR+"','run'])","submit\nselected \\/ col/row")
    }else{
        if(CR=="col"){
            let col = split(document.getElementById("middle_val").innerHTML,":")[0]
            let keyword = document.getElementById("SearchKeyword").value
            console.log(col)
            voidinp()
            conn.PASSTHROUGH(["Search","col",col,keyword],(rowNum)=>{
                console.log(rowNum)
               let style = ""
               for (let i=0;i<rowNum.length;i++){
                console.log(rowNum[i])
                style +=".row_"+rowNum[i]+"{color:#ff0000;}\n"
               }
               document.getElementById("jsSearch").innerHTML=style
            })
        }else{
            let row = split(document.getElementById("middle_val").innerHTML,":")[1]
            let keyword = document.getElementById("SearchKeyword").value
            console.log(row)
            voidinp()
            conn.PASSTHROUGH(["Search","row",row,keyword],(colNum)=>{
                console.log(colNum)
               let style = ""
               for (let i=0;i<colNum.length;i++){
                console.log(colNum[i])
                style +=" .col_"+colNum[i]+"{color:#ff0000;}\n"
               }
               document.getElementById("jsSearch").innerHTML=style
        })
        }
    }
}

function replace(mode){
    if (mode == "prev"){
        createInputs(["new Value"],["replaceN"],"replace('run')","submit\nselected \\/ field")
    }else{
        let repVal = document.getElementById("replaceN").value
        voidinp()
        let coords = document.getElementById("middle_val").innerHTML
        conn.PASSTHROUGH(["Replace",coords,toURL(convert(repVal))],(none)=>{})
        reload()
    }
}

function remove(mode){
    if (mode[1]=="prev"){
        createInputs([],[],"remove(['"+mode[0]+"','run'])","submit\nselected \\/ row/col")
    }else{
        voidinp()
        if (mode[0]=="row"){
            let coords = split(document.getElementById("middle_val").innerHTML,":")[1]
            conn.PASSTHROUGH(["Remove","row",coords],(none)=>{})
            reload()
        }else{
            let coords = split(document.getElementById("middle_val").innerHTML,":")[0]
            conn.PASSTHROUGH(["Remove","col",coords],(none)=>{})
            reload()
        }
    }
}

function sendCmd(){
    let command = document.getElementById("cmdInp").value
    document.getElementById("cmdInp").value=""
    let scmd = Usplit(command, " ")
    if (scmd[0].charAt(0)=="!"){
        switch (scmd[0]){
            case "!Reload":
                reload()
                document.getElementById("responses").innerHTML+="<p>>> ("+command+"):<br> Reload in progress</p>"
                break
            case "!Clear":
                document.getElementById("responses").innerHTML=""
                break
        }
    }else{
    conn.PASSTHROUGH(scmd,(res)=>{        
        let history="<p>>> ("+command+"):<br>"
        for(let i = 0; i<res.length;i++){
            
            let curr =split(deconvert(res[i]),"\n")
            let str=""
            for (j=0;j<curr.length;j++){
                str+=curr[j]
                if (j+1 < curr.length){
                    str+="<br>"
                }
            }

            history+=" -> "+str+" <- "
        }
        history+="</p>"
        document.getElementById("responses").innerHTML+=history
    })}
}