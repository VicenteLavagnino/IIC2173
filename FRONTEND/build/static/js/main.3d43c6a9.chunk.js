(this["webpackJsonpmy-app"]=this["webpackJsonpmy-app"]||[]).push([[0],{23:function(e,a,t){e.exports=t.p+"static/media/logo.f29dbd4e.png"},25:function(e,a,t){e.exports=t(38)},31:function(e,a,t){},38:function(e,a,t){"use strict";t.r(a);var n=t(0),l=t.n(n),r=t(22),o=t.n(r),c=(t(15),t(10)),s=t(8),i=(t(31),t(23)),u=t.n(i),d=t(40),m=t(41),p=t(42),E=t(43),g=t(44),h=t(45),b=t(46),f=t(47);var y=()=>{const{loginWithRedirect:e}=Object(s.b)();return l.a.createElement("div",null,l.a.createElement("button",{className:"signup-button",onClick:()=>{e({screen_hint:"signup",audience:"https://api.grupo8",scope:"read:fixtures write:bonds write:funds read:users"})}},"Reg\xedstrate"))};var v=()=>{const{loginWithRedirect:e}=Object(s.b)();return l.a.createElement("button",{className:"login-button",onClick:async()=>{await e({appState:{returnTo:"/callback"},audience:"https://api.grupo8",scope:"openid profile email create:users read:users"})}},"Log In")};var w=()=>{const{logout:e}=Object(s.b)();return l.a.createElement("button",{className:"logout-button",onClick:async()=>{await e({appState:{returnTo:"/"},audience:"https://api.grupo8",scope:"openid profile email"})}},"Log out")};var O=function(){const[e,a]=Object(n.useState)(!1),[t,r]=Object(n.useState)(!1),[o,i]=Object(n.useState)(!1),{isAuthenticated:O}=Object(s.b)();return Object(n.useEffect)(()=>{(async()=>{try{const e=await fetch("http://localhost:8000/heartbeat");if("operational"!==(await e.json()).status)throw new Error("Service not operational");r(!0)}catch(e){r(!1),i(!0)}})()},[]),l.a.createElement("div",null,o&&l.a.createElement(d.a,{color:"danger",toggle:()=>i(!1)},"El servicio no est\xe1 operativo. No se pueden cargar las recomendaciones."),l.a.createElement(m.a,{color:"light",fixed:"top",expand:"sm"},l.a.createElement(p.a,{tag:c.a,to:"/"},l.a.createElement("img",{alt:"logo",src:u.a,style:{height:30,width:30,marginRight:"10px"}}),"G8 Gambling"),l.a.createElement(E.a,{onClick:()=>a(!e),"aria-label":"Toggle navigation"}),l.a.createElement(g.a,{isOpen:e,navbar:!0},l.a.createElement(h.a,{className:"me-auto",navbar:!0},l.a.createElement(b.a,null,l.a.createElement(f.a,{tag:c.a,to:"/matches"},"Partidos"))),l.a.createElement(h.a,{className:"ms-auto",navbar:!0},O?l.a.createElement(l.a.Fragment,null,l.a.createElement(b.a,null,l.a.createElement(f.a,{href:"/mybonds"},"Mis Bonos")),t&&l.a.createElement(b.a,null,l.a.createElement(f.a,{href:"/myrecomendations"},"Recomendaciones")),l.a.createElement(b.a,null,l.a.createElement(f.a,{href:"/mywallet"},"Billetera")),l.a.createElement(b.a,null,l.a.createElement(w,null))):l.a.createElement(l.a.Fragment,null,l.a.createElement(b.a,null,l.a.createElement(v,null)),l.a.createElement(b.a,null,l.a.createElement(y,null)))))))},S=t(48),k=t(49),j=t(50);var C=e=>{let{currentPage:a,totalPages:t,onPageChange:n}=e;const r=[];let o=Math.max(1,a-Math.floor(2.5)),c=o+5-1;c>t&&(c=t,o=Math.max(1,c-5+1));for(let s=o;s<=c;s++)r.push(l.a.createElement(S.a,{active:s===a,key:s},l.a.createElement(k.a,{onClick:()=>n(s),href:"#"},s)));return l.a.createElement(j.a,{"aria-label":"Page navigation example"},l.a.createElement(S.a,{disabled:a<=1},l.a.createElement(k.a,{first:!0,href:"#",onClick:()=>n(1)})),l.a.createElement(S.a,{disabled:a<=1},l.a.createElement(k.a,{previous:!0,href:"#",onClick:()=>n(a-1)})),r,l.a.createElement(S.a,{disabled:a>=t},l.a.createElement(k.a,{next:!0,href:"#",onClick:()=>n(a+1)})),l.a.createElement(S.a,{disabled:a>=t},l.a.createElement(k.a,{last:!0,href:"#",onClick:()=>n(t)})))},x=t(65),N=t(71),P=t(66),A=t(70),B=t(57),R=t(58),T=t(59),_=t(60),z=t(61),F=t(62),M=t(63),q=t(64),D=t(72),L=t(51),I=t(52),V=t(53),$=t(54),W=t(55),U=t(56);var G=e=>{let{fixtureId:a,homeTeam:t,awayTeam:r}=e;const{getAccessTokenSilently:o}=Object(s.b)(),[c,i]=Object(n.useState)(!1),[u,m]=Object(n.useState)(""),[p,E]=Object(n.useState)(""),[g,h]=Object(n.useState)(null),[b,f]=Object(n.useState)(null),[y,v]=Object(n.useState)(0),[w,O]=Object(n.useState)(!1),S=()=>{i(!c),c&&(m(""),E(""),h(null),f(null))},k=Object(n.useCallback)(async()=>{console.log("Iniciando obtenci\xf3n de saldo...");try{const e=await o({audience:"https://api.grupo8",scope:"read:wallet"});console.log("Token obtenido, haciendo solicitud de saldo...");const a=await A.a.get("http://localhost:8000/users/me",{headers:{Authorization:"Bearer "+e}});console.log("Respuesta completa de /users/me:",a),console.log("Saldo recibido:",a.data.wallet),v(Number(a.data.wallet)),console.log("Saldo actualizado en el estado:",Number(a.data.wallet))}catch(g){console.error("Error detallado al obtener el saldo:",g),g.response&&(console.error("Datos de la respuesta de error:",g.response.data),console.error("Estado de la respuesta de error:",g.response.status)),h("No se pudo obtener el saldo. Por favor, intenta de nuevo m\xe1s tarde.")}},[o]);Object(n.useEffect)(()=>{k()},[k]);return l.a.createElement("div",null,l.a.createElement(N.a,{color:"primary",onClick:S},"Comprar Bono"),l.a.createElement(D.a,{isOpen:c,toggle:S},l.a.createElement(L.a,{toggle:S},"Comprar Bono"),l.a.createElement(I.a,null,g&&l.a.createElement(d.a,{color:"danger"},g),b&&l.a.createElement(d.a,{color:"success"},b),l.a.createElement(V.a,null,l.a.createElement($.a,{for:"result"},"Selecciona el resultado"),l.a.createElement(W.a,{type:"select",name:"result",id:"result",value:u,onChange:e=>m(e.target.value)},l.a.createElement("option",{value:""},"Seleccione"),l.a.createElement("option",{value:"home"},"Victoria Local (",t.name,")"),l.a.createElement("option",{value:"---"},"Empate"),l.a.createElement("option",{value:"away"},"Victoria Visitante (",r.name,")"))),l.a.createElement(V.a,null,l.a.createElement($.a,{for:"amount"},"Monto de bonos $1000 c/u"),l.a.createElement(W.a,{type:"number",name:"amount",id:"amount",value:p,onChange:e=>E(e.target.value),min:"0",step:"1000"})),l.a.createElement("p",null,"Saldo actual: $",y.toFixed(2))),l.a.createElement(U.a,null,l.a.createElement(N.a,{color:"primary",onClick:async()=>{h(null),f(null);const e=parseFloat(p),t=1e3*e;if(u)if(isNaN(e)||e<=0)h("Por favor, ingresa un monto v\xe1lido mayor a cero.");else if(console.log("Saldo actual:",y),console.log("Monto a comprar:",t),t>y)h("No tienes suficiente saldo para realizar esta compra. Tu saldo actual es: $"+y.toFixed(2));else{O(!0);try{const t=await o({audience:"https://api.grupo8",scope:"buy:bond"});console.log("Enviando solicitud de compra...");const n=await A.a.post("http://localhost:8000/buy_bond",{fixture_id:a.toString(),result:u,amount:e},{headers:{Authorization:"Bearer "+t}});console.log("Respuesta completa del servidor:",n),console.log("Datos de la respuesta:",n.data),f("Bono comprado exitosamente: "+(n.data.message||"Compra realizada")),E(""),m(""),void 0!==n.data.newBalance?(v(Number(n.data.newBalance)),console.log("Nuevo saldo establecido:",n.data.newBalance)):(console.log("Actualizando saldo..."),await k())}catch(g){console.error("Error al comprar el bono:",g),g.response?h("Error al comprar el bono: "+(g.response.data.detail||g.response.data.message||g.response.data)):g.request?h("No se pudo conectar con el servidor. Por favor, intenta de nuevo m\xe1s tarde."):h("Ocurri\xf3 un error al procesar tu solicitud. Por favor, intenta de nuevo.")}finally{O(!1)}}else h("Por favor, selecciona un resultado.")},disabled:w},w?"Comprando...":"Comprar")," ",l.a.createElement(N.a,{className:"webpay-button",onClick:async()=>{h(null),f(null);const e=parseFloat(p);if(u)if(isNaN(e)||e<=0)h("Por favor, ingresa una cantidad v\xe1lida mayor a cero.");else{O(!0);try{const t=await o({audience:"https://api.grupo8",scope:"buy:bond"});console.log("Enviando solicitud de compra y creaci\xf3n de transacci\xf3n en Webpay...");const n=await A.a.get("http://localhost:8000/webpay/create",{params:{fixture_id:a.toString(),result:u,amount:e},headers:{Authorization:"Bearer "+t}}),l=document.createElement("form");l.method="POST",l.action=n.data.url;const r=document.createElement("input");r.type="hidden",r.name="token_ws",r.value=n.data.token,l.appendChild(r),document.body.appendChild(l),l.submit()}catch(g){console.error("Error al crear la transacci\xf3n:",g),g.response?h("Error al crear la transacci\xf3n: "+g.response.data.detail):g.request?h("No se pudo conectar con el servidor. Por favor, intenta de nuevo m\xe1s tarde."):h("Ocurri\xf3 un error al procesar tu solicitud. Por favor, intenta de nuevo.")}finally{O(!1)}}else h("Por favor, selecciona un resultado.")},disabled:w},w?"Comprando...":"Webpay")," ",l.a.createElement(N.a,{color:"secondary",onClick:S},"Cancelar"))))};var J=function(e){let{id:a,fixture:t,league:r,odds:o,teams:c}=e;const{getAccessTokenSilently:i}=Object(s.b)(),[u,d]=Object(n.useState)(40),m=o.length>0?o[0]:null,p=m&&"Match Winner"===m.name?m.values:[{odd:"-"},{odd:"-"},{odd:"-"}],E=Object(n.useCallback)(async()=>{try{const e=await i({audience:"https://api.grupo8"}),a=await A.a.get(`http://localhost:8000/fixtures/${t.id}/available_bonds`,{headers:{Authorization:"Bearer "+e}});d(a.data.available_bonds||40)}catch(e){e.response&&404===e.response.status?(console.error("Bonos no encontrados para este partido"),d(40)):console.error("Error fetching available bonds:",e)}},[i,t.id]);return Object(n.useEffect)(()=>{E()},[E]),l.a.createElement(B.a,{className:"mb-4"},l.a.createElement(R.a,{sm:"3"},l.a.createElement(T.a,{body:!0},l.a.createElement(_.a,null,r.name),l.a.createElement(z.a,null,"Fecha del partido: ",new Date(t.date).toLocaleString()),l.a.createElement(F.a,{flush:!0},l.a.createElement(M.a,{className:"d-flex align-items-center"},l.a.createElement(z.a,{className:"d-flex align-items-center"},"Local :"),l.a.createElement(q.a,{alt:"Logo of "+c.home.name,src:c.home.logo,style:{height:25,width:25,marginRight:10}}),l.a.createElement(z.a,null,c.home.name)),l.a.createElement(M.a,{className:"d-flex align-items-center"},l.a.createElement(z.a,{className:"d-flex align-items-center"},"Visita :"),l.a.createElement(q.a,{alt:"Logo of "+c.away.name,src:c.away.logo,style:{height:25,width:25,marginRight:10}}),l.a.createElement(z.a,null,c.away.name)),l.a.createElement(M.a,null,l.a.createElement(z.a,null,"Bonos disponibles: ",u)),l.a.createElement(M.a,null,l.a.createElement(G,{fixtureId:t.id,homeTeam:c.home,awayTeam:c.away}))))),l.a.createElement(R.a,{sm:"3"},l.a.createElement(T.a,{body:!0},l.a.createElement(z.a,null,"Victoria Local: ",p[0].odd))),l.a.createElement(R.a,{sm:"3"},l.a.createElement(T.a,{body:!0},l.a.createElement(z.a,null,"Empate: ",p[1].odd))),l.a.createElement(R.a,{sm:"3"},l.a.createElement(T.a,{body:!0},l.a.createElement(z.a,null,"Victoria Visitante: ",p[2].odd))))};class H extends n.Component{constructor(){super(...arguments),this.state={data:[],page:1,count:5,total:0,loading:!1,error:null},this.getRequest=async()=>{const{page:e,count:a}=this.state,{getAccessTokenSilently:t}=this.props.auth0,n={page:e,count:a};this.setState({loading:!0,error:null});try{const e=await t({audience:"https://api.grupo8",scope:"read:fixtures"}),a=await A.a.get("http://localhost:8000/fixtures",{params:n,headers:{Authorization:"Bearer "+e}});console.log(a.data),this.setState({data:a.data.fixtures,total:a.data.total,loading:!1})}catch(l){console.error("Error al obtener los partidos:",l),this.setState({loading:!1,error:"No se pudieron obtener los partidos. Por favor, intente de nuevo m\xe1s tarde."})}},this.handlePageChange=e=>{this.setState({page:e},this.getRequest)}}componentDidMount(){this.getRequest()}render(){const{data:e,page:a,count:t,total:n,loading:r,error:o}=this.state,s=Math.ceil(n/t);return l.a.createElement(x.a,null,l.a.createElement("div",{className:"container"},l.a.createElement(O,null)),l.a.createElement("div",null,l.a.createElement("h1",null,"Partidos"),l.a.createElement("div",{style:{marginBottom:"20px"}},l.a.createElement(c.a,{to:"/matchesbydate"},l.a.createElement(N.a,{color:"primary"},"Filtrar por fecha")))),l.a.createElement("div",null,r&&l.a.createElement(P.a,{color:"primary"}),o&&l.a.createElement("p",{className:"text-danger"},o),!r&&!o&&e.length>0?e.map(e=>l.a.createElement(J,{key:e.fixture.id,id:e.fixture.id,league:e.league,teams:e.teams,odds:e.odds,fixture:e.fixture,goals:e.goals})):!r&&!o&&l.a.createElement("p",null,"No hay partidos disponibles.")),s>1&&l.a.createElement(C,{currentPage:a,totalPages:s,onPageChange:this.handlePageChange}))}}var Z=Object(s.c)(H),K=t(67);class Q extends n.Component{constructor(){super(...arguments),this.state={data:[],selectedDate:"",page:1,count:5,total:0,loading:!1,error:null},this.handleDateChange=e=>{this.setState({selectedDate:e.target.value})},this.getRequest=async()=>{const{selectedDate:e,page:a,count:t}=this.state,{getAccessTokenSilently:n}=this.props.auth0,l={page:a,count:t};e&&(l.date=e),this.setState({loading:!0,error:null});try{const e=await n({audience:"https://api.grupo8",scope:"read:fixtures"}),a=await A.a.get("http://localhost:8000/fixtures",{params:l,headers:{Authorization:"Bearer "+e}});console.log(a.data),this.setState({data:a.data.fixtures,total:a.data.total,loading:!1})}catch(r){console.error("Error al obtener los partidos filtrados por fecha:",r),this.setState({loading:!1,error:"No se pudieron obtener los partidos."})}},this.handleSubmit=e=>{e.preventDefault(),this.setState({page:1},this.getRequest)},this.handlePageChange=e=>{this.setState({page:e},this.getRequest)}}componentDidMount(){this.getRequest()}render(){const{data:e,selectedDate:a,page:t,count:n,total:r,loading:o,error:c}=this.state,s=Math.ceil(r/n);return l.a.createElement(x.a,null,l.a.createElement("div",{className:"container"},l.a.createElement(O,null)),l.a.createElement("div",null,l.a.createElement("h1",null,"Filtrar Partidos por Fecha"),l.a.createElement(K.a,{onSubmit:this.handleSubmit},l.a.createElement(V.a,null,l.a.createElement($.a,{for:"date"},"Selecciona una Fecha"),l.a.createElement(W.a,{type:"date",name:"date",id:"date",value:a,onChange:this.handleDateChange,required:!0})),l.a.createElement(N.a,{color:"primary",type:"submit",disabled:o},o?l.a.createElement(P.a,{size:"sm"}):"Filtrar"))),l.a.createElement("br",null),l.a.createElement("div",null,o&&l.a.createElement(P.a,{color:"primary"}),c&&l.a.createElement("p",{className:"text-danger"},c),!o&&!c&&e.length>0?e.map(e=>l.a.createElement(J,{key:e._id,id:e._id,league:e.league,teams:e.teams,odds:e.odds,fixture:e.fixture})):!o&&!c&&l.a.createElement("p",null,"No se encontraron partidos para la fecha seleccionada.")),s>1&&l.a.createElement(C,{currentPage:t,totalPages:s,onPageChange:this.handlePageChange,disabled:o}))}}var X=Object(s.c)(Q);var Y=function(){return l.a.createElement(x.a,null,l.a.createElement(O,null),l.a.createElement(y,null))};function ee(){return l.a.createElement("div",{className:"App"},l.a.createElement("div",{className:"container"},l.a.createElement(O,null)))}var ae=t(5);function te(){const e=Object(ae.p)();return console.error(e),l.a.createElement(D.a,null,l.a.createElement(L.a,null,l.a.createElement(O,null)),l.a.createElement(I.a,null,l.a.createElement("div",{id:"error-page"},l.a.createElement("h1",null,"Oops!"),l.a.createElement("p",null,"Sorry, an unexpected error has occurred."),l.a.createElement("p",null,l.a.createElement("i",null,e.statusText||e.message)))))}var ne=()=>{const{isAuthenticated:e,isLoading:a,getAccessTokenSilently:t,user:r}=Object(s.b)(),o=Object(ae.m)(),[c,i]=Object(n.useState)(null);return Object(n.useEffect)(()=>{a||(console.log("Auth0 cargado. isAuthenticated:",e),e?(async()=>{console.log("Iniciando createUser");try{console.log("Obteniendo token");const e=await t({audience:"https://api.grupo8",scope:"create:users"});console.log("Token obtenido:",e);const a={email:r.email,wallet:0};console.log("Datos del usuario:",a),console.log("Llamando al backend");const n=await A.a.post("http://localhost:8000/users",a,{headers:{Authorization:"Bearer "+e,"Content-Type":"application/json"},timeout:5e3});console.log("Respuesta del backend:",n.data),console.log("Redirigiendo al usuario"),o("/")}catch(c){console.error("Error creating user:",c),c.response?(o("/"),i(`Error del servidor: ${c.response.status} - ${c.response.data.detail||c.response.data}`)):c.request?i("No se recibi\xf3 respuesta del servidor. Verifica que el backend est\xe9 en ejecuci\xf3n."):i("Error de configuraci\xf3n: "+c.message)}})():(console.log("Usuario no autenticado. Redirigiendo..."),o("/")))},[e,a,t,r,o]),a?l.a.createElement("div",null,"Cargando autenticaci\xf3n..."):c?l.a.createElement("div",null,l.a.createElement("h2",null,"Error:"),l.a.createElement("p",null,c),l.a.createElement("button",{onClick:()=>o("/")},"Volver al inicio")):l.a.createElement("div",null,"Procesando callback...")},le=t(68),re=t(69);var oe=()=>{const{getAccessTokenSilently:e}=Object(s.b)(),[a,t]=Object(n.useState)(0),[r,o]=Object(n.useState)(!1),[c,i]=Object(n.useState)(""),[u,d]=Object(n.useState)(null),m=()=>o(!r),p=Object(n.useCallback)(async()=>{console.log("Obteniendo saldo..."),console.log("API URL:","http://localhost:8000");try{const a=await e({audience:"https://api.grupo8",scope:"read:wallet"});console.log("Token obtenido");const n=await A.a.get("http://localhost:8000/users/me",{headers:{Authorization:"Bearer "+a}});console.log("Respuesta del servidor:",n.data),t(n.data.wallet)}catch(u){console.error("Error al obtener el saldo:",u),d("No se pudo obtener el saldo.")}},[e]);Object(n.useEffect)(()=>{p()},[p]);return l.a.createElement(T.a,{className:"my-2",style:{width:"18rem"}},l.a.createElement(le.a,null,"Mi Billetera"),l.a.createElement(re.a,null,l.a.createElement(_.a,{tag:"h5"},"Saldo:"),l.a.createElement(z.a,null,"$",a.toFixed(2)),l.a.createElement(N.a,{color:"primary",onClick:m},"Cargar")),u&&l.a.createElement("p",{className:"text-danger"},u),l.a.createElement(D.a,{isOpen:r,toggle:m},l.a.createElement(L.a,{toggle:m},"Cargar Fondos"),l.a.createElement(I.a,null,l.a.createElement(V.a,null,l.a.createElement($.a,{for:"monto"},"Monto"),l.a.createElement(W.a,{type:"number",name:"monto",id:"monto",placeholder:"Ingresa el monto a cargar",value:c,onChange:e=>i(e.target.value),min:"0"}))),l.a.createElement(U.a,null,l.a.createElement(N.a,{color:"primary",onClick:async()=>{const a=parseFloat(c);if(isNaN(a)||a<=0)alert("Por favor, ingresa un monto v\xe1lido.");else try{const t=await e({audience:"https://api.grupo8",scope:"add:funds"});console.log("Enviando solicitud para agregar fondos...");const n=await A.a.post("http://localhost:8000/add_funds",{amount:a},{headers:{Authorization:"Bearer "+t}});console.log("Respuesta al agregar fondos:",n.data),await p(),i(""),m(),d(null)}catch(u){console.error("Error al cargar fondos:",u),d("No se pudo cargar el monto en la billetera.")}}},"Cargar")," ",l.a.createElement(N.a,{color:"secondary",onClick:m},"Cancelar"))))};var ce=function(){return l.a.createElement(x.a,null,l.a.createElement("div",null,l.a.createElement(O,null)),l.a.createElement("div",null,l.a.createElement(oe,null)))};var se=()=>{const[e,a]=Object(n.useState)(null),[t,r]=Object(n.useState)(null),o=Object(ae.m)();return Object(n.useEffect)(()=>{const t=new URLSearchParams(window.location.search).get("token_ws");t?(async()=>{try{const e=await A.a.get("http://localhost:8000/webpay/commit?token_ws="+t);"AUTHORIZED"===e.data.status?(r("Transaction confirmed successfully."),setTimeout(()=>{o("/matches")},3e3)):(a("Transaction failed: "+e.data.message),setTimeout(()=>{o("/matches")},3e3))}catch(e){a("An error occurred while committing the transaction.")}})():a("No transaction token found.")},[o]),l.a.createElement("div",null,e&&l.a.createElement(d.a,{color:"danger"},e),t&&l.a.createElement(d.a,{color:"success"},t))};var ie=()=>{const{getAccessTokenSilently:e}=Object(s.b)(),[a,t]=Object(n.useState)([]),[r,o]=Object(n.useState)(null),c=Object(n.useCallback)(async()=>{try{const a=await e({audience:"https://api.grupo8",scope:"read:bonds"}),n=await A.a.get("http://localhost:8000/users/me/purchased_bonds",{headers:{Authorization:"Bearer "+a}});t(n.data),o(null)}catch(r){console.error("Error fetching purchased bonds:",r),o("No se pudo obtener la lista de bonos comprados.")}},[e]);return Object(n.useEffect)(()=>{c()},[c]),l.a.createElement(T.a,{className:"my-2"},l.a.createElement(le.a,null,"Bonos Comprados"),l.a.createElement(re.a,null,r&&l.a.createElement("p",{className:"text-danger"},r),0!==a.length||r?l.a.createElement(F.a,null,a.map(e=>l.a.createElement(M.a,{key:e.request_id},l.a.createElement(_.a,{tag:"h6"},e.fixture_details.home_team," vs"," ",e.fixture_details.away_team),l.a.createElement(z.a,null,"Fecha: ",new Date(e.fixture_details.date).toLocaleString()),l.a.createElement(z.a,null,"Resultado Apostado: ",e.result),l.a.createElement(z.a,null,"Monto: $",e.amount),l.a.createElement(z.a,null,"Estado: ",e.status)))):l.a.createElement(z.a,null,"No has comprado ning\xfan bono a\xfan.")))};var ue=function(){return l.a.createElement(x.a,null,l.a.createElement("div",null,l.a.createElement(O,null)),l.a.createElement("div",null,l.a.createElement(ie,null)))};var de=()=>{const{getAccessTokenSilently:e}=Object(s.b)(),[a,t]=Object(n.useState)([]),[r,o]=Object(n.useState)(null),[c,i]=Object(n.useState)(!0),u=Object(n.useCallback)(async()=>{try{const a=await e({audience:"https://api.grupo8",scope:"read:predictions"}),n=await A.a.get("http://localhost:8000/users/me/makeprediction",{headers:{Authorization:"Bearer "+a}});t(n.data),o(null)}catch(a){console.error("Error fetching predictions:",a),o("No se pudo obtener las predicciones.")}finally{i(!1)}},[e]);return Object(n.useEffect)(()=>{u()},[u]),l.a.createElement(x.a,null,l.a.createElement(T.a,{className:"my-4"},l.a.createElement(re.a,null,l.a.createElement(_.a,{tag:"h4"},"Predicciones de Bonos"),c&&l.a.createElement("p",null,"Cargando predicciones..."),r&&l.a.createElement(d.a,{color:"danger"},r),a.length>0?a.map((e,a)=>l.a.createElement("div",{key:a},l.a.createElement(z.a,null,l.a.createElement("strong",null,"Fixture:")," ",e.fixture_details.home_team," vs."," ",e.fixture_details.away_team),l.a.createElement(z.a,null,l.a.createElement("strong",null,"Resultado Esperado:")," ",e.result),l.a.createElement(z.a,null,l.a.createElement("strong",null,"Monto Apostado:")," $",e.amount),l.a.createElement("hr",null))):!c&&l.a.createElement("p",null,"No se encontraron predicciones."))))};var me=function(){return l.a.createElement(x.a,null,l.a.createElement("div",null,l.a.createElement(O,null)),l.a.createElement("div",null,l.a.createElement(de,null)))};const pe=Object(c.c)([{path:"/",element:l.a.createElement(ee,null),errorElement:l.a.createElement(te,null)},{path:"/signup",element:l.a.createElement(Y,null)},{path:"/matches",element:l.a.createElement(Z,null)},{path:"/matchesbydate",element:l.a.createElement(X,null)},{path:"/callback",element:l.a.createElement(ne,null)},{path:"/mywallet",element:l.a.createElement(ce,null)},{path:"/webpay/commit",element:l.a.createElement(se,null)},{path:"/myBonds",element:l.a.createElement(ue,null)},{path:"myrecomendations",element:l.a.createElement(me,null)}]);o.a.createRoot(document.getElementById("root")).render(l.a.createElement(l.a.StrictMode,null,l.a.createElement(s.a,{domain:"dev-g6ig26k6q2sak71r.us.auth0.com",clientId:"6lkpWajDdVqfdgWOnI8serwE8xmkcqtM",authorizationParams:{redirect_uri:window.location.origin+"/callback",audience:"https://api.grupo8",scope:"openid profile email create:users read:users"}},l.a.createElement(c.b,{router:pe}))))}},[[25,1,2]]]);
//# sourceMappingURL=main.3d43c6a9.chunk.js.map