(function(){
  const menu=document.querySelector('.menu-btn'),panel=document.querySelector('.mobile-panel');
  if(menu&&panel){
    const close=()=>{panel.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'};
    menu.addEventListener('click',()=>{const open=!panel.classList.contains('open');panel.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});
    panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    window.addEventListener('resize',()=>{if(window.innerWidth>900)close()});
  }
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
  document.querySelectorAll('.reveal,.stagger,.stagger-cards,.drop-card').forEach(el=>io.observe(el));
  const form=document.getElementById('contactForm'),toast=document.getElementById('toast');
  if(form&&toast)form.addEventListener('submit',e=>{e.preventDefault();toast.classList.add('show');form.reset();setTimeout(()=>toast.classList.remove('show'),3200)});

  const KEY='aeroward_cart_v2';
  const readCart=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
  const saveCart=c=>{localStorage.setItem(KEY,JSON.stringify(c));renderCart();renderDashboard();};
  const money=n=>'$'+Number(n).toFixed(0);
  const allCartEls=()=>document.querySelectorAll('.cart-count');
  function cartCount(){return readCart().reduce((s,i)=>s+i.qty,0)}
  function renderCart(){
    const cart=readCart();
    allCartEls().forEach(el=>el.textContent=cartCount());
    document.querySelectorAll('.cart-items').forEach(box=>{
      box.innerHTML=cart.map((item,i)=>`<div class="cart-item"><img src="${item.image||'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg?auto=compress&cs=tinysrgb&w=300'}" alt=""><div><strong>${item.name}</strong><small>${item.kind==='service'?'Service':'Jacket'} · ${money(item.price)}</small><div class="qty"><button type="button" data-qty="${i}" data-delta="-1">−</button><span>${item.qty}</span><button type="button" data-qty="${i}" data-delta="1">+</button></div><button class="remove-item" type="button" data-remove="${i}">Remove</button></div><span class="cart-item-price">${money(item.price*item.qty)}</span></div>`).join('');
      box.querySelectorAll('[data-qty]').forEach(btn=>btn.addEventListener('click',()=>{const c=readCart(),idx=+btn.dataset.qty;c[idx].qty+=+btn.dataset.delta;if(c[idx].qty<1)c.splice(idx,1);saveCart(c)}));
      box.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{const c=readCart();c.splice(+btn.dataset.remove,1);saveCart(c)}));
    });
    const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
    document.querySelectorAll('.cart-total').forEach(el=>el.textContent=money(total));
    document.querySelectorAll('.cart-empty').forEach(el=>el.style.display=cart.length?'none':'block');
  }
  function addItem(item){
    const c=readCart();const key=(item.kind||'product')+'-'+item.name;const found=c.find(i=>i.key===key);if(found)found.qty++;else c.push({...item,key,qty:1});saveCart(c);openDrawer();}
  function openDrawer(){const d=document.querySelector('.cart-drawer');if(!d)return;d.classList.add('open');d.setAttribute('aria-hidden','false');document.body.classList.add('cart-lock')}
  function closeDrawer(){const d=document.querySelector('.cart-drawer');if(!d)return;d.classList.remove('open');d.setAttribute('aria-hidden','true');document.body.classList.remove('cart-lock')}
  document.querySelectorAll('.cart-trigger').forEach(b=>b.addEventListener('click',openDrawer));
  document.querySelectorAll('.cart-close,.cart-backdrop').forEach(b=>b.addEventListener('click',closeDrawer));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
  document.querySelectorAll('.add-cart').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.shop-card');addItem({name:card.dataset.name,price:+card.dataset.price,kind:'product',image:card.querySelector('img').src})}));
  document.querySelectorAll('.add-service').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('[data-service]');addItem({name:card.dataset.name,price:+card.dataset.price,kind:'service',image:card.querySelector('img').src})}));
  document.querySelectorAll('.filter-pill').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter-pill').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const filter=btn.dataset.filter;document.querySelectorAll('.shop-card').forEach(card=>card.classList.toggle('is-hidden',filter!=='all'&&card.dataset.category!==filter))}));
  document.querySelectorAll('.quick-view').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.shop-card');btn.textContent=card.dataset.name+' · '+money(card.dataset.price);setTimeout(()=>btn.textContent='Quick view',1400)}));

  function renderDashboard(){
    const box=document.querySelector('.dashboard-cart-items');if(!box)return;const cart=readCart();const empty=document.querySelector('.dashboard-empty');
    box.innerHTML=cart.map((item,i)=>`<div class="dashboard-cart-item"><img src="${item.image}" alt="${item.name}"><div><strong>${item.name}</strong><small>${item.kind==='service'?'Service':'Jacket'} · ${money(item.price)} each</small><div class="qty"><button type="button" data-dqty="${i}" data-delta="-1">−</button><span>${item.qty}</span><button type="button" data-dqty="${i}" data-delta="1">+</button></div></div><div><strong>${money(item.price*item.qty)}</strong><button class="remove-item" type="button" data-dremove="${i}">Remove</button></div></div>`).join('');
    box.querySelectorAll('[data-dqty]').forEach(btn=>btn.addEventListener('click',()=>{const c=readCart(),idx=+btn.dataset.dqty;c[idx].qty+=+btn.dataset.delta;if(c[idx].qty<1)c.splice(idx,1);saveCart(c)}));
    box.querySelectorAll('[data-dremove]').forEach(btn=>btn.addEventListener('click',()=>{const c=readCart();c.splice(+btn.dataset.dremove,1);saveCart(c)}));
    if(empty)empty.style.display=cart.length?'none':'block';
    const total=cart.reduce((s,i)=>s+i.price*i.qty,0),count=cart.reduce((s,i)=>s+i.qty,0);
    document.querySelectorAll('.dash-total').forEach(el=>el.textContent=money(total));
    document.querySelectorAll('.dash-item-count').forEach(el=>el.textContent=count);
  }
  document.querySelectorAll('.dash-clear').forEach(b=>b.addEventListener('click',()=>{localStorage.removeItem(KEY);renderCart();renderDashboard()}));
  document.querySelectorAll('.demo-checkout').forEach(b=>b.addEventListener('click',()=>{b.querySelector('span').textContent=readCart().length?'Demo order ready ✓':'Add items first';setTimeout(()=>b.querySelector('span').textContent='Demo checkout',1800)}));
  renderCart();renderDashboard();
})();
