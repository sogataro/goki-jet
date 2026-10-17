// Owner-controlled receiver bound to the Goki Jet feedback spreadsheet.
const FEEDBACK_URL = 'https://script.google.com/macros/s/AKfycbziBDTHRJ35YbUjdVSOZiUY0PmeWZUv9bF24N2r7mDZdHeWxVUjyubPoYIE-ek7ryrA/exec';
const FEEDBACK_ENABLED = true;
async function sendFeedback({app,version,lang,message,contact='',website=''}){
 if(!FEEDBACK_ENABLED||!FEEDBACK_URL)return {ok:false,error:'not-configured'};
 if(app!=='goki-jet'||typeof message!=='string'||!message.trim()||message.length>2000||contact.length>200)return {ok:false,error:'invalid'};
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch(FEEDBACK_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({app,version,lang,message,contact,website}),credentials:'omit',signal:controller.signal});if(!response.ok)return {ok:false,error:'network'};const result=await response.json();return result.ok===true?{ok:true}:{ok:false,error:result.error||'server'};}catch{return {ok:false,error:'network'};}finally{clearTimeout(timer);}
}
