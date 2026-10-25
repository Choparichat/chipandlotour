// Page titles, descriptions, addresses and structured data.
// The block below is a copy of the shared SEO block inside index.html. Keep both identical.
  /*SEO-SHARED-BEGIN  The same block lives in index.html and in functions/_seo.js. Keep the two copies identical. */
  var SEO=(function(){
    var ORIGIN="https://chipandlotour.com";
    function tx(o,k,lg){ if(!o) return ""; var v=o[k+"_"+lg]; if(v==null||v==="") v=o[k+"_en"]; return v==null?"":String(v); }
    function clean(s,n){ s=String(s==null?"":s).replace(/\s+/g," ").trim(); if(n&&s.length>n){ s=s.slice(0,n-1); var k=s.lastIndexOf(" "); if(k>n*0.6) s=s.slice(0,k); s=s.replace(/[\s,;:·|–—-]+$/,"")+"…"; } return s; }
    function ea(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function slugify(s){ return String(s||"").toLowerCase().replace(/['’]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60).replace(/-+$/,""); }
    function tourSlug(it){ var s=slugify(it&&it.title_en); return (s?s+"-":"")+encodeURIComponent(String((it&&it.id)||"")); }
    function num(s){ var n=parseFloat(String(s==null?"":s).replace(/[^\d.]/g,"")); return isNaN(n)?0:n; }
    function fmt(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,","); }
    function promoOn(it,today){ var pp=String((it&&it.promo_price)||"").trim(); if(!pp) return false; if(it.promo_start&&today<it.promo_start) return false; if(it.promo_end&&today>it.promo_end) return false; return true; }
    function priceNow(it,today){ return promoOn(it,today)?num(it.promo_price):num(it.price); }
    function byId(L,id){ L=L||[]; for(var i=0;i<L.length;i++) if(L[i]&&L[i].id===id) return L[i]; return null; }
    function tourDest(data,tr){ var D=data.destinations||[], d=byId(D,tr.dest); if(d) return d; for(var i=0;i<D.length;i++) if(D[i].cat===(tr.cat||"thai")) return D[i]; return null; }
    function toursOf(data,d){ return (data.tours||[]).filter(function(tr){ var x=tourDest(data,tr); return !!x&&x.id===d.id; }); }
    function inSub(d,tr,sid){ var subs=d.subs||[]; if(sid==="other") return !tr.sub||!subs.some(function(s){ return s.id===tr.sub; }); return tr.sub===sid; }
    function tourId(data,seg,arr){ seg=String(seg||""); if(byId(data&&data[arr||"tours"],seg)) return seg; var k=seg.lastIndexOf("-"); return k<0?seg:seg.slice(k+1); }
    function dec(s){ try{ return decodeURIComponent(s); }catch(e){ return s; } }
    // "/th/tours/chiangmai" -> "#/tours/chiangmai"; on the home page the real #hash is kept (old "#/..." links and "#contact")
    function vhash(pathname,hash){ var p=String(pathname||"/").replace(/^\/th(?=\/|$)/,"").replace(/\/+$/,""); if(!p||p==="/index.html") return hash||""; return "#"+p; }
    function isTh(pathname){ return /^\/th(\/|$)/.test(String(pathname||"")); }
    function route(h,data){ h=String(h||""); var m;
      if(h.charAt(0)!=="#"||h.charAt(1)!=="/") return {v:"home"};
      var q=h.slice(2).split(/[?#]/)[0].replace(/\/+$/,""), a=q?q.split("/"):[];
      if(!a.length) return {v:"home"};
      if(a[0]==="tour"&&a.length===2&&a[1]) return {v:"tour",id:tourId(data,dec(a[1]))};
      if(a[0]==="activity"&&a.length===2&&a[1]) return {v:"act",id:tourId(data,dec(a[1]),"activities")};
      if(a[0]==="tours"&&a.length===1) return {v:"tours"};
      if(a[0]==="tours"&&a.length<=3&&a[1]) return {v:"dest",id:dec(a[1]),sub:a[2]?dec(a[2]):""};
      if(a.length===1&&/^(activities|deals|tickets|top5|rentals)$/.test(a[0])) return {v:a[0]};
      return {v:"home",nf:true};
    }
    function path(data,r,lg){ var pre=lg==="th"?"/th":"", it;
      if(!r||r.nf) return pre+"/";
      if(r.v==="tours") return pre+"/tours";
      if(r.v==="dest") return pre+"/tours/"+encodeURIComponent(r.id)+(r.sub?"/"+encodeURIComponent(r.sub):"");
      if(r.v==="tour"){ it=byId(data&&data.tours,r.id); return pre+"/tour/"+(it?tourSlug(it):encodeURIComponent(r.id)); }
      if(r.v==="act"){ it=byId(data&&data.activities,r.id); return pre+"/activity/"+(it?tourSlug(it):encodeURIComponent(r.id)); }
      if(/^(activities|deals|tickets|top5|rentals)$/.test(r.v)) return pre+"/"+r.v;
      return pre+"/";
    }
    // "#/tours/x" or "#contact" -> real address
    function href(data,h,lg){ h=String(h||""); if(h.charAt(0)!=="#") return h;
      if(h.charAt(1)!=="/") return (lg==="th"?"/th/":"/")+((h==="#"||h==="#top")?"":h);
      var r=route(h,data); if(r.nf) return (lg==="th"?"/th":"")+h.slice(1);
      return path(data,r,lg); }
    function abs(origin,u){ u=String(u||""); if(/^https?:\/\//i.test(u)) return u; if(/^(images|files)\//.test(u)) return origin+"/"+u; return ""; }
    function names(L,k,lg,n){ return (L||[]).map(function(x){ return clean(tx(x,k,lg)); }).filter(Boolean).slice(0,n); }
    function agency(data,origin){ var c=data.contact||{}, b=data.brand||{}, o={"@type":"TravelAgency","@id":origin+"/#agency","name":clean(b.name||"Chip' n Lo Tour"),"url":origin+"/"};
      var img=abs(origin,(data.hero||{}).img), logo=abs(origin,b.logo); if(img||logo) o.image=img||logo; if(logo) o.logo=logo;
      var ph=clean(String(c.phone||"").split("/")[0]); if(ph) o.telephone=ph; if(c.email) o.email=clean(c.email);
      var ad=clean(c.addr_en||c.addr_th); if(ad){ var pc=ad.match(/\b\d{5}\b/); o.address={"@type":"PostalAddress","streetAddress":ad,"addressLocality":"Chiang Mai","addressRegion":"Chiang Mai","addressCountry":"TH"}; if(pc) o.address.postalCode=pc[0]; }
      var g=String(c.map_embed||"").match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/); if(g) o.geo={"@type":"GeoCoordinates","latitude":+g[2],"longitude":+g[1]};
      var hm=String(c.hours_en||"").match(/(\d{1,2})[:.](\d{2})\s*[–—-]\s*(\d{1,2})[:.](\d{2})/); if(hm&&/daily|every\s*day/i.test(c.hours_en)) o.openingHours="Mo-Su "+("0"+hm[1]).slice(-2)+":"+hm[2]+"-"+("0"+hm[3]).slice(-2)+":"+hm[4];
      var sa=(data.social||[]).map(function(s){ return s&&(s.url||s.link); }).filter(function(u){ return /^https?:\/\//i.test(u||""); }); if(sa.length) o.sameAs=sa;
      o.priceRange="฿฿"; return o; }
    function crumbs(L){ return {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":L.map(function(x,i){ return {"@type":"ListItem","position":i+1,"name":x[0],"item":x[1]}; })}; }
    // Title, description, canonical address and structured data for one page
    function meta(data,r,lg,today,origin){
      data=data||{}; r=r||{v:"home"}; lg=lg==="th"?"th":"en"; origin=origin||ORIGIN; today=today||"";
      var th=lg==="th", S=data.seo||{}, brand=clean((data.brand&&data.brand.name)||"Chip' n Lo Tour");
      var m={lang:lg,noindex:false,notFound:false,type:"website",image:"",ld:[],alts:[],only:false,site:brand};
      var title="", desc="", img="", d, it, L, i, list, nm, sub, sn, T, P=function(x,l){ return origin+path(data,x,l); };
      var home=[th?"หน้าแรก":"Home",P({v:"home"},lg)], toursC=[th?"ทัวร์":"Tours",P({v:"tours"},lg)];
      if(r.nf){ m.notFound=true; }
      else if(r.v==="tour"){
        it=byId(data.tours,r.id);
        if(!it) m.notFound=true;
        else { m.only=it.cat==="intl"; L=m.only?"th":lg; d=tourDest(data,it); T=clean(tx(it,"title",L)||it.title_th||it.code||"Tour"); nm=d?clean(d.cat==="intl"?(d.name_th||d.name_en):tx(d,"name",L)):"";
          title=T+((nm&&T.toLowerCase().indexOf(nm.toLowerCase())<0)?(L==="th"?" – ทัวร์"+nm:" – "+nm+" Tour"):"")+" | "+brand;
          var pn=priceNow(it,today), du=clean(tx(it,"dur",L)), bits=[]; if(pn) bits.push((L==="th"?"เริ่ม ฿":"From ฿")+fmt(pn)); if(du) bits.push(du);
          desc=clean((bits.length?bits.join(" · ")+". ":"")+clean(tx(it,"desc",L)||tx(it,"hl",L)||tx(it,"itin",L)),165); img=abs(origin,it.img);
          var pics=[it.img].concat(it.photos||[]).map(function(u){ return abs(origin,u); }).filter(Boolean).slice(0,6), cu=origin+path(data,r,L);
          var o={"@context":"https://schema.org","@type":pn?"Product":"TouristTrip","name":T,"description":clean(tx(it,"desc",L)||tx(it,"hl",L)||T,500),"url":cu};
          if(pics.length) o.image=pics;
          if(pn){ o.category="Tours"; if(it.code) o.sku=clean(it.code); o.brand={"@type":"Brand","name":brand};
            o.offers={"@type":"Offer","url":cu,"priceCurrency":"THB","price":String(pn),"availability":"https://schema.org/InStock","seller":{"@id":origin+"/#agency"}};
            if(promoOn(it,today)&&it.promo_end) o.offers.priceValidUntil=it.promo_end; var vf=(promoOn(it,today)&&it.promo_start)?it.promo_start:today; if(vf) o.offers.validFrom=vf; m.type="product"; }
          else o.provider={"@id":origin+"/#agency"};
          m.ld.push(o);
          var C=[[L==="th"?"หน้าแรก":"Home",P({v:"home"},L)],[L==="th"?"ทัวร์":"Tours",P({v:"tours"},L)]]; if(d) C.push([nm,P({v:"dest",id:d.id},L)]); C.push([T,cu]); m.ld.push(crumbs(C)); }
      }
      else if(r.v==="act"){
        it=byId(data.activities,r.id);
        if(!it) m.notFound=true;
        else { L=lg; var tk=it.cat==="tickets"; T=clean(tx(it,"title",L)||it.title_th||it.code||"Activity");
          title=T+(L==="th"?(tk?" – จองตั๋ว เชียงใหม่":" – กิจกรรมเชียงใหม่"):(/chiang ?mai/i.test(T)?"":" – Chiang Mai"))+" | "+brand;
          var pa=priceNow(it,today), da=clean(tx(it,"dur",L)), ba=[]; if(pa) ba.push((L==="th"?"เริ่ม ฿":"From ฿")+fmt(pa)); if(da) ba.push(da);
          desc=clean((ba.length?ba.join(" · ")+". ":"")+clean(tx(it,"desc",L)||tx(it,"itin",L)),165); img=abs(origin,it.img);
          var pa2=[it.img].concat(it.photos||[]).map(function(u){ return abs(origin,u); }).filter(Boolean).slice(0,6), ca=origin+path(data,r,L);
          var oa={"@context":"https://schema.org","@type":pa?"Product":"TouristTrip","name":T,"description":clean(tx(it,"desc",L)||T,500),"url":ca};
          if(pa2.length) oa.image=pa2;
          if(pa){ oa.category=tk?"Tickets":"Activities"; if(it.code) oa.sku=clean(it.code); oa.brand={"@type":"Brand","name":brand};
            oa.offers={"@type":"Offer","url":ca,"priceCurrency":"THB","price":String(pa),"availability":"https://schema.org/InStock","seller":{"@id":origin+"/#agency"}};
            if(promoOn(it,today)&&it.promo_end) oa.offers.priceValidUntil=it.promo_end; var va=(promoOn(it,today)&&it.promo_start)?it.promo_start:today; if(va) oa.offers.validFrom=va; m.type="product"; }
          else oa.provider={"@id":origin+"/#agency"};
          m.ld.push(oa);
          m.ld.push(crumbs([[L==="th"?"หน้าแรก":"Home",P({v:"home"},L)],tk?[L==="th"?"ซื้อตั๋ว":"Tickets",P({v:"tickets"},L)]:[L==="th"?"กิจกรรม":"Activities",P({v:"activities"},L)],[T,ca]])); }
      }
      else if(r.v==="dest"){
        d=byId(data.destinations,r.id); sub=r.sub||"";
        if(!d||(sub&&sub!=="all"&&sub!=="other"&&!byId(d.subs,sub))) m.notFound=true;
        else { m.only=d.cat==="intl"; L=m.only?"th":lg; nm=clean(d.cat==="intl"?(d.name_th||d.name_en):tx(d,"name",L)); list=toursOf(data,d);
          if(!(d.subs||[]).length) sub=""; else if(sub&&sub!=="all") list=list.filter(function(tr){ return inSub(d,tr,sub); });
          sn=(sub&&sub!=="all"&&sub!=="other")?clean(tx(byId(d.subs,sub),"name",L)):"";
          if(L==="th"){ title=(sn?sn+" – ":"")+"ทัวร์"+nm+(sub==="all"?" ทุกโปรแกรม":"")+" | "+brand; desc="รวม "+list.length+" โปรแกรมทัวร์"+nm+(sn?" หมวด"+sn:"")+(list.length?": "+names(list,"title",L,4).join(" · "):"")+" พร้อมราคา รูป และโปรแกรมการเดินทาง"; }
          else { title=(sn?sn+" – ":(sub==="all"?"All ":""))+nm+" Tours"+(sn||sub?"":" & Day Trips")+" | "+brand; desc=list.length+" tour program"+(list.length===1?"":"s")+" in "+nm+(sn?" ("+sn+")":"")+(list.length?": "+names(list,"title",L,4).join(" · "):"")+". Prices, photos and itineraries."; }
          desc=clean(desc,170); img=abs(origin,d.img||d.allImg)||abs(origin,(list[0]||{}).img);
          if(sub==="other") m.noindex=true;
          r={v:"dest",id:d.id,sub:sub};
          var C2=[[L==="th"?"หน้าแรก":"Home",P({v:"home"},L)],[L==="th"?"ทัวร์":"Tours",P({v:"tours"},L)],[nm,P({v:"dest",id:d.id},L)]]; if(sn) C2.push([sn,P(r,L)]); m.ld.push(crumbs(C2));
          if(list.length) m.ld.push({"@context":"https://schema.org","@type":"ItemList","name":clean(title.split(" | ")[0]),"itemListElement":list.slice(0,40).map(function(tr,k){ return {"@type":"ListItem","position":k+1,"name":clean(tx(tr,"title",L)||tr.title_th||tr.code||"Tour"),"url":P({v:"tour",id:tr.id},L)}; })}); }
      }
      else if(r.v==="tours"){ list=(data.destinations||[]).filter(function(x){ return toursOf(data,x).length; });
        if(th){ title="โปรแกรมทัวร์ทั้งหมด – ทัวร์เชียงใหม่ ภาคเหนือ และต่างประเทศ | "+brand; desc="เลือกโปรแกรมทัวร์ตามจังหวัดและประเทศ: "+list.map(function(x){ return clean(x.name_th||x.name_en); }).join(" · ")+" พร้อมราคาและโปรแกรมการเดินทาง"; }
        else { title="Tours from Chiang Mai – Day Trips & Packages | "+brand; desc="Browse every tour program by destination: "+list.filter(function(x){ return x.cat!=="intl"; }).map(function(x){ return clean(x.name_en||x.name_th); }).join(", ")+" and more. Prices, photos and itineraries for each tour."; }
        desc=clean(desc,170); m.ld.push(crumbs([home,toursC])); }
      else if(r.v==="activities"){ list=(data.activities||[]).filter(function(x){ return x.cat!=="tickets"; });
        title=th?"กิจกรรมในเชียงใหม่ – ผจญภัย ธรรมชาติ วัฒนธรรม | "+brand:"Things to Do in Chiang Mai – Activities & Experiences | "+brand;
        desc=clean((th?"กิจกรรมเที่ยวเชียงใหม่: ":"Activities in Chiang Mai: ")+names(list,"title",lg,6).join(" · ")+(th?" จองได้ทาง LINE และ WhatsApp":". Book on WhatsApp or LINE."),170);
        m.ld.push(crumbs([home,[th?"กิจกรรม":"Activities",P(r,lg)]])); }
      else if(r.v==="tickets"){ list=(data.activities||[]).filter(function(x){ return x.cat==="tickets"; });
        title=th?"จองตั๋วในเชียงใหม่ – ตั๋วรถ โชว์ และสถานที่ท่องเที่ยว | "+brand:"Chiang Mai Tickets – Buses, Shows & Attractions | "+brand;
        desc=clean((th?"จองตั๋วกับเรา: ":"Book with us: ")+names(list,"title",lg,6).join(" · ")+(th?" สอบถามได้ทาง LINE และ WhatsApp":". Message us on WhatsApp or LINE."),170);
        m.ld.push(crumbs([home,[th?"ซื้อตั๋ว":"Tickets",P(r,lg)]])); }
      else if(r.v==="deals"){ title=th?"โปรไฟไหม้ – ทัวร์ราคาพิเศษ | "+brand:"Hot Deals – Discounted Tours from Chiang Mai | "+brand;
        desc=th?"รวมโปรแกรมทัวร์และกิจกรรมราคาพิเศษช่วงนี้ จองก่อนโปรหมด":"Limited-time prices on tours and activities. Book before the deal ends."; }
      else if(r.v==="rentals"){ title=th?"เช่ามอเตอร์ไซค์ รถยนต์ รถตู้ เชียงใหม่ | "+brand:"Motorbike, Car & Van Rental in Chiang Mai | "+brand;
        desc=clean(clean(tx(data.rental,"sub",lg))+" "+(data.bikes||[]).filter(function(x){ return x&&x.name&&(!x.type||x.type==="bike"); }).map(function(x){ return clean(x.name); }).slice(0,5).join(" · "),170);
        m.ld.push(crumbs([home,[th?"เช่ารถ":"Rentals",P(r,lg)]])); }
      else if(r.v==="top5"){ title="Top 3 | "+brand; desc=""; m.noindex=true; }
      else { r={v:"home"};
        title=clean(S["title_"+lg])||(th?"ทัวร์เชียงใหม่ ดอยอินทนนท์ ปางช้าง ทัวร์ต่างประเทศ | "+brand:"Chiang Mai Tours, Elephants & Doi Inthanon | "+brand);
        desc=clean(S["desc_"+lg])||(th?"บริษัททัวร์เชียงใหม่ที่มีใบอนุญาต ทัวร์ดอยอินทนนท์ เชียงราย ปางช้าง เทศกาล ทัวร์ต่างประเทศ จองตั๋วรถและโชว์ เช่ามอเตอร์ไซค์ สอบถามทาง LINE และ WhatsApp":"Licensed local tour agency in Chiang Mai: Doi Inthanon and Chiang Rai day trips, elephant sanctuary visits, festival tours, tickets and motorbike rental.");
        var ag=agency(data,origin); ag["@context"]="https://schema.org"; m.ld.push(ag);
        var ws={"@context":"https://schema.org","@type":"WebSite","name":brand,"url":origin+"/","inLanguage":["en","th"]}; if(/chip/i.test(brand)) ws.alternateName=["Chip'N Lo Tour","Chip n Lo Tour","Chip and Lo Tour"]; m.ld.push(ws); }
      if(m.notFound){ title=(th?"ไม่พบหน้านี้":"Page not found")+" | "+brand; desc=""; m.noindex=true; m.ld=[]; m.only=false; r={v:"home"}; }
      m.title=title; m.desc=desc;
      m.image=img||abs(origin,(data.hero||{}).img)||abs(origin,(data.brand||{}).logo);
      m.path=path(data,r,m.only?"th":lg); m.canonical=origin+m.path;
      if(!m.noindex&&!m.only) m.alts=[["en",origin+path(data,r,"en")],["th",origin+path(data,r,"th")],["x-default",origin+path(data,r,"en")]];
      return m;
    }
    // Tags for <head>. Every tag carries data-seo so the page can swap them when the visitor moves to another page.
    function head(m,noTitle){ var H=[], p=function(k,v){ if(v) H.push('<meta data-seo property="'+k+'" content="'+ea(v)+'">'); };
      if(!noTitle) H.push("<title>"+ea(m.title)+"</title>");
      if(m.desc) H.push('<meta data-seo name="description" content="'+ea(m.desc)+'">');
      if(m.noindex) H.push('<meta data-seo name="robots" content="noindex">');
      else H.push('<link data-seo rel="canonical" href="'+ea(m.canonical)+'">');
      (m.alts||[]).forEach(function(a){ H.push('<link data-seo rel="alternate" hreflang="'+a[0]+'" href="'+ea(a[1])+'">'); });
      p("og:site_name",m.site); p("og:type","website"); p("og:title",m.title); p("og:description",m.desc); p("og:url",m.canonical); p("og:image",m.image); p("og:locale",(m.only||m.lang==="th")?"th_TH":"en_US");
      H.push('<meta data-seo name="twitter:card" content="'+(m.image?"summary_large_image":"summary")+'">');
      (m.ld||[]).forEach(function(o){ H.push('<script data-seo type="application/ld+json">'+JSON.stringify(o).replace(/</g,"\\u003c")+"<\/script>"); });
      return H.join("\n"); }
    // Plain-HTML summary for crawlers and link previews that do not run JavaScript (server side only)
    function plain(data,r,lg,m){ var L=m.only?"th":lg, th=L==="th", H=[], it, d, a=function(x,l,label){ return '<a href="'+ea(path(data,x,l))+'">'+ea(label)+"</a>"; };
      H.push("<h1>"+ea(m.title.split(" | ")[0])+"</h1>"); if(m.desc) H.push("<p>"+ea(m.desc)+"</p>");
      if(r.v==="tour"&&(it=byId(data.tours,r.id))){ var body=clean(tx(it,"desc",L)), itin=String(tx(it,"itin",L)||"").slice(0,6000); if(body) H.push("<p>"+ea(body)+"</p>"); if(itin) H.push("<pre>"+ea(itin)+"</pre>"); }
      if(r.v==="act"&&(it=byId(data.activities,r.id))){ var ab=clean(tx(it,"desc",L)), ai=String(tx(it,"itin",L)||"").slice(0,6000); if(ab) H.push("<p>"+ea(ab)+"</p>"); if(ai) H.push("<pre>"+ea(ai)+"</pre>"); }
      if(r.v==="activities"||r.v==="tickets"||r.v==="act"){ var AL=(data.activities||[]).filter(function(x){ return x&&x.id&&(x.title_en||x.title_th)&&((r.v==="tickets")===(x.cat==="tickets")||r.v==="act"); }); if(AL.length) H.push("<ul>"+AL.slice(0,60).map(function(x){ var pn=priceNow(x,""); return "<li>"+a({v:"act",id:x.id},lg,clean(tx(x,"title",lg)))+(pn?" – ฿"+fmt(pn):"")+"</li>"; }).join("")+"</ul>"); }
      H.push("<p>"+[a({v:"home"},lg,th?"หน้าแรก":"Home"),a({v:"tours"},lg,th?"ทัวร์":"Tours"),a({v:"activities"},lg,th?"กิจกรรม":"Activities"),a({v:"tickets"},lg,th?"ซื้อตั๋ว":"Tickets"),a({v:"rentals"},lg,th?"เช่ารถ":"Rentals"),a({v:"deals"},lg,th?"โปรไฟไหม้":"Hot Deals")].join(" · ")+"</p>");
      var D=(data.destinations||[]).filter(function(x){ return toursOf(data,x).length; });
      if(D.length) H.push("<ul>"+D.map(function(x){ var l=x.cat==="intl"?"th":lg; return "<li>"+a({v:"dest",id:x.id},l,clean(x.cat==="intl"?(x.name_th||x.name_en):tx(x,"name",l)))+"</li>"; }).join("")+"</ul>");
      var T=(r.v==="dest"&&(d=byId(data.destinations,r.id)))?toursOf(data,d):(data.tours||[]);
      if(T.length) H.push("<ul>"+T.slice(0,60).map(function(tr){ var l=tr.cat==="intl"?"th":lg, pn=priceNow(tr,""); return "<li>"+a({v:"tour",id:tr.id},l,clean(tx(tr,"title",l)))+(pn?" – ฿"+fmt(pn):"")+"</li>"; }).join("")+"</ul>");
      return "<noscript>"+H.join("")+"</noscript>"; }
    // Every indexable address: [loc, [[hreflang, href], ...]]
    function urls(data,origin){ origin=origin||ORIGIN; var U=[], seen={}, add=function(r,only){ var m=meta(data,r,only?"th":"en","",origin); if(m.notFound||m.noindex||seen[m.canonical]) return; seen[m.canonical]=1; U.push([m.canonical,m.alts]);
        if(!m.only){ var t=meta(data,r,"th","",origin); if(!seen[t.canonical]){ seen[t.canonical]=1; U.push([t.canonical,t.alts]); } } };
      add({v:"home"}); add({v:"tours"});
      (data.destinations||[]).forEach(function(d){ var L=toursOf(data,d); if(!L.length) return; var only=d.cat==="intl"; add({v:"dest",id:d.id},only);
        if((d.subs||[]).length){ add({v:"dest",id:d.id,sub:"all"},only); d.subs.forEach(function(s){ if(L.some(function(tr){ return tr.sub===s.id; })) add({v:"dest",id:d.id,sub:s.id},only); }); } });
      (data.tours||[]).forEach(function(tr){ if(tr&&tr.id&&(tr.title_en||tr.title_th)) add({v:"tour",id:tr.id},tr.cat==="intl"); });
      ["activities","tickets","rentals","deals"].forEach(function(v){ add({v:v}); });
      (data.activities||[]).forEach(function(x){ if(x&&x.id&&(x.title_en||x.title_th)) add({v:"act",id:x.id}); });
      return U; }
    return {ORIGIN:ORIGIN,slugify:slugify,tourSlug:tourSlug,tourId:tourId,vhash:vhash,isTh:isTh,route:route,path:path,href:href,meta:meta,head:head,plain:plain,urls:urls,ea:ea};
  })();
  /*SEO-SHARED-END*/
export default SEO;
