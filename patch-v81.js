/* MMA Career Simulator V81 - dynamic fight layer */
(function(){
  const oldCreator=window.creator;
  const oldStart=window.start;
  function creatorV81(){
    let p=Object.keys(profiles).map((x,i)=>`<input class="pick" id="p${i}" type="radio" name="p" value="${x}"><label class="picklabel" for="p${i}"><b>${x}</b><small>${profiles[x].desc}<br>Boks ${profiles[x].b>0?'+':''}${profiles[x].b} · Grappling ${profiles[x].g>0?'+':''}${profiles[x].g} · Zapasy ${profiles[x].w>0?'+':''}${profiles[x].w} · BJJ ${profiles[x].j>0?'+':''}${profiles[x].j}</small></label>`).join('');
    let w=weights.map((x,i)=>`<input class="pick" id="w${i}" type="radio" name="w" value="${x}"><label class="picklabel" for="w${i}"><b>${x}</b><small>Kategoria wagowa</small></label>`).join('');
    app.innerHTML=`<div class="creator"><div class="box"><div class="brand">MMA <span>CAREER SIMULATOR</span></div><p class="muted">V81 · tryb kariery</p><div class="field"><label>IMIĘ I NAZWISKO</label><input id="name" placeholder="np. Jan Kowalski"></div><h3>PROFIL ZAWODNIKA</h3><div class="grid">${p}</div><h3>KATEGORIA WAGOWA</h3><div class="grid">${w}</div><div class="actions"><span></span><button class="btn primary" onclick="start()">ROZPOCZNIJ KARIERĘ →</button></div></div></div>`;
  }
  window.creator=creatorV81;

  const situations=[
    {title:'HIGH KICK',text:'Juras: „Opuścił gardę! Jest miejsce na high kicka!”',chance:38,type:'ko'},
    {title:'PRAWY PROSTY',text:'Juras: „Lewą rękę ma nisko. Wchodź prawym!”',chance:72,type:'score'},
    {title:'SIERPOWY NA WĄTROBĘ',text:'Juras: „Celuj w wątrobę — stoi szeroko!”',chance:61,type:'damage'},
    {title:'LOW KICK',text:'Juras: „Obijaj tę nogę, on już ledwo chodzi!”',chance:80,type:'leg'},
    {title:'LATAJĄCE KOLANO',text:'Juras: „Wysoko się odsłonił! Latające kolano!”',chance:31,type:'ko'},
    {title:'SPINNING BACKFIST',text:'Juras: „Możesz obrócić, ale to musi wejść idealnie!”',chance:27,type:'ko'},
    {title:'SINGLE LEG',text:'Juras: „Pierwsza próba po jedną nogę — tego nie broni!”',chance:68,type:'wrestle'},
    {title:'DOUBLE LEG',text:'Juras: „Schodź nisko i prowadź go do siatki!”',chance:62,type:'wrestle'},
    {title:'GROUND & POUND',text:'Juras: „Łokcie z góry! Nie dawaj mu oddechu!”',chance:64,type:'damage'},
    {title:'BALACHA',text:'Juras: „Ma odsłoniętą rękę — jest balacha!”',chance:48,type:'sub'},
    {title:'TRÓJKĄT NOGAMI',text:'Juras: „Zamknij trójkąt! Niech się teraz martwi!”',chance:42,type:'sub'},
    {title:'RNC',text:'Juras: „Masz plecy! Złap duszenie i nie puszczaj!”',chance:51,type:'sub'},
    {title:'JAB · DYSTANS',text:'Juras: „Spokojnie. Jab, dystans i zabieramy rundę.”',chance:88,type:'score'}
  ];
  function situationSet(f){
    let a=situations.slice();
    if(f.oppHp<58)a=a.filter(x=>['LOW KICK','HIGH KICK','SIERPOWY NA WĄTROBĘ','GROUND & POUND','JAB · DYSTANS'].includes(x.title));
    if(f.playerSt<38)a=a.filter(x=>['JAB · DYSTANS','LOW KICK','PRAWY PROSTY','SINGLE LEG'].includes(x.title));
    if(f.oppStyle==='wrestler')a=a.filter(x=>x.title!=='SINGLE LEG'||f.oppSt<65);
    return a.length?a:a.slice(0,5);
  }
  window.decision=function(){
    const f=state.fight, a=situationSet(f);
    return `<div class="decision"><b>⏸️ MOMENT WALKI · JURAS PODPOWIADA</b><p class="muted">${esc(a[0].text)}</p><div class="acts">${a.slice(0,8).map((x,i)=>`<button class="act" onclick="chooseV81(${i})"><b>${x.title}</b><small>${x.chance}% · ${x.text.replace('Juras: ','')}</small></button>`).join('')}</div></div>`;
  };
  window.chooseV81=function(i){
    const f=state.fight;if(!f||!f.prompt)return;
    const a=situationSet(f),x=a[i];if(!x)return;
    f.prompt=false;
    const success=Math.random()*100<x.chance;
    const oldHp=f.oppHp,oldSt=f.oppSt;
    f.log.unshift(`🎙️ JURAS: ${x.text.replace('Juras: ','')}`);
    if(success){
      f.roundAdv += x.type==='score'?1:(x.type==='ko'||x.type==='sub'?3:2);
      if(x.type==='ko'){f.oppHp=Math.max(0,f.oppHp-(18+Math.random()*25));f.ko=(f.ko||0)+1;}
      if(x.type==='damage'){f.oppHp=Math.max(0,f.oppHp-(12+Math.random()*16));f.oppSt=Math.max(0,f.oppSt-10);}
      if(x.type==='leg'){f.oppHp=Math.max(0,f.oppHp-8);f.oppSt=Math.max(0,f.oppSt-15);}
      if(x.type==='wrestle'){f.oppSt=Math.max(0,f.oppSt-12);f.oppHp=Math.max(0,f.oppHp-7);f.position='ground';}
      if(x.type==='sub'){f.oppHp=Math.max(0,f.oppHp-7);f.sub=(f.sub||0)+1;}
      if(x.title==='SPINNING BACKFIST'||x.title==='LATAJĄCE KOLANO'){
        state.ig+=120;state.viral=(state.viral||0)+1;state.media.unshift('🔥 JURAS VIRAL: reakcja na efektowną akcję zaczęła krążyć po social mediach.');state.rep=Math.min(100,state.rep+1);
      }
      f.log.unshift(`🟢 UDANA AKCJA: ${x.title}.`);
      if(f.oppHp<=0){f.finish='KO';finishFight();return;}
      if(x.type==='sub' && f.sub>=2 && Math.random()<.32){f.finish='SUBMISSION';finishFight();return;}
    }else{
      f.roundAdv -= x.type==='score'?0.5:1;
      f.playerHp=Math.max(1,f.playerHp-(x.type==='ko'||x.type==='sub'?7:4));
      f.playerSt=Math.max(0,f.playerSt-(x.type==='wrestle'?8:4));
      f.log.unshift(`🔴 NIEUDANA AKCJA: ${x.title}. Rywal odpowiada kontrą.`);
      if(f.playerHp<=0){f.finish='KO_LOSS';finishFight();return;}
    }
    fightScreen();requestAnimationFrame(fightTick);
  };
  window.fightScreen=(function(original){return function(){original();}})(window.fightScreen);
  window.endRound=(function(original){return function(){
    const f=state.fight;if(!f)return original();
    let a=f.roundAdv,my=10,op=9;
    if(a>=5){my=10;op=8}else if(a<=-4){my=8;op=10}else if(a<0){my=9;op=10}
    f.roundScores.push([my,op]);
    f.log.unshift(`🔔 KONIEC RUNDY ${f.round}: ${my}-${op}. 🎙️ JURAS: „Dobra runda, ale teraz słuchaj narożnika.”`);
    if(f.round<3){
      f.round++;f.t=0;f.events=0;f.roundAdv=0;f.playerSt=Math.min(100,f.playerSt+12);f.oppSt=Math.min(100,f.oppSt+10);f.prompt='corner';fightScreen();
    }else original();
  };})(window.endRound);

  const oldDecision=window.decision;
  window.decision=(function(realDecision){return function(){
    if(state.fight&&state.fight.prompt==='corner'){
      return `<div class="decision"><b>🗣️ NAROŻNIK · JURAS: „SŁUCHAJ TERAZ!”</b><p class="muted">Wybierz instrukcję na następną rundę. Nie wybierasz techniki — ustawiasz plan walki.</p><div class="acts">
      <button class="act" onclick="cornerV81('fire')"><b>🔥 CHARAKTER</b><small>„KURWA, CIŚNIJ! Jedziesz z nim!”</small></button>
      <button class="act" onclick="cornerV81('striking')"><b>🥊 TECHNICZNY · STÓJKA</b><small>„Podchodzi z prawej i opuszcza rękę. Sierp na wątrobę, potem low kick.”</small></button>
      <button class="act" onclick="cornerV81('wrestling')"><b>🤼 TECHNICZNY · ZAPASY</b><small>„Pierwsza próba po jedną nogę. Nie broni tego — prowadź do siatki.”</small></button>
      </div></div>`;
    }
    return realDecision();
  };})(oldDecision);
  window.cornerV81=function(plan){
    const f=state.fight;if(!f)return;f.prompt=false;f.cornerPlan=plan;
    if(plan==='fire'){state.motivation=Math.min(100,state.motivation+8);f.roundAdv+=.5;f.log.unshift('🗣️ NAROŻNIK: „KURWA, CIŚNIJ! PAMIĘTASZ TRENING? JEDZIESZ Z NIM!”');}
    if(plan==='striking'){f.roundAdv+=1;f.next=Math.max(8,(f.next||12)-3);f.log.unshift('🧠 NAROŻNIK: „Prawa ręka opuszczona. Sierp na wątrobę i obijaj nogi.”');}
    if(plan==='wrestling'){f.roundAdv+=1;f.oppSt=Math.max(0,f.oppSt-8);f.log.unshift('🤼 NAROŻNIK: „Single leg. Nie broni pierwszej próby. Schodź nisko i prowadź do siatki.”');}
    fightScreen();requestAnimationFrame(fightTick);
  };
  setTimeout(()=>creatorV81(),0);
})();