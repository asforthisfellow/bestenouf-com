(function(){
  'use strict';
  if(document.querySelector('.cr,.cd,.faith-cursor-crown,.faith-cursor-cross'))return;
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  var ns='http://www.w3.org/2000/svg';
  var crown=document.createElement('div');
  crown.className='faith-cursor-crown';
  crown.setAttribute('aria-hidden','true');
  var svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 40 40');
  svg.setAttribute('focusable','false');
  svg.setAttribute('aria-hidden','true');
  var ring=document.createElementNS(ns,'circle');
  ring.setAttribute('class','faith-cursor-crown__ring');
  ring.setAttribute('cx','20');ring.setAttribute('cy','20');ring.setAttribute('r','12.5');
  var thorns=document.createElementNS(ns,'path');
  thorns.setAttribute('class','faith-cursor-crown__thorns');
  thorns.setAttribute('d','m20 3-1 5.2m9.1-2.1-3 4.4m8.7 2.2-5 1.9m6.4 7.7-5.2-1m-.6 9.3-3.6-3.9M20.5 37l-.3-5.3m-8.8 1.2 3.1-4.4M6 26.4l5-1.9m-6.2-7.8 5.2 1m.6-9.2 3.6 3.8');
  svg.appendChild(ring);svg.appendChild(thorns);crown.appendChild(svg);

  var cross=document.createElement('div');
  cross.className='faith-cursor-cross';
  cross.setAttribute('aria-hidden','true');
  document.body.appendChild(crown);document.body.appendChild(cross);
  document.documentElement.classList.add('has-faith-cursor');

  var x=-100,y=-100,px=x,py=y,started=false;
  function move(e){x=e.clientX;y=e.clientY;if(!started){started=true;crown.classList.add('is-ready');cross.classList.add('is-ready')}}
  function draw(){px+=(x-px)*.42;py+=(y-py)*.42;crown.style.left=px+'px';crown.style.top=py+'px';cross.style.left=px+'px';cross.style.top=py+'px';requestAnimationFrame(draw)}
  function interactive(target){return target&&target.closest&&target.closest('a,button,input,select,textarea,summary,label,[role="button"],[contenteditable="true"]')}
  function updateVisibility(e){var hide=!!interactive(e.target);crown.classList.toggle('is-hidden',hide);cross.classList.toggle('is-hidden',hide)}
  document.addEventListener('mousemove',move,{passive:true});
  document.addEventListener('mouseover',updateVisibility,{passive:true});
  document.addEventListener('mouseout',updateVisibility,{passive:true});
  window.addEventListener('blur',function(){crown.classList.add('is-hidden');cross.classList.add('is-hidden')});
  window.addEventListener('focus',function(){crown.classList.remove('is-hidden');cross.classList.remove('is-hidden')});
  requestAnimationFrame(draw);
})();
