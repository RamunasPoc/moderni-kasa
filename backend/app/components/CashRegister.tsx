'use client';

import { useState } from 'react';
import { getProducts, createProduct } from '@/app/actions/productActions';
import { createReceipt } from '@/app/actions/receiptActions';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  vatRate: number;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  vatRate: number;
};

export default function CashRegister({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'quick'>('catalog');

  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState('');
  const [quickQuantity, setQuickQuantity] = useState('1');

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data as Product[]);
  }

  function addToCart(product: Product) {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { id: product.id, name: product.name, price: product.price, quantity: 1, vatRate: product.vatRate }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function processCheckout(itemsToCheckout: CartItem[]) {
    if (itemsToCheckout.length === 0) return;

    setLoading(true);
    setSuccessMessage('');

    try {
      const receiptNumber = Math.floor(100000 + Math.random() * 900000);
      const currentTotal = itemsToCheckout.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const result = await createReceipt({
        receiptNumber,
        totalAmount: currentTotal,
        items: itemsToCheckout.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          vatRate: item.vatRate,
        })),
        cryptoSign: 'iEKA_SIGN_' + Math.random().toString(36).substring(7).toUpperCase(),
      });

      if (result.success) {
        setSuccessMessage(`✓ Čekis Nr. ${receiptNumber} sėkmingai patvirtintas ir išsiųstas į i.EKA!`);
        setCart([]);
        setQuickName('');
        setQuickPrice('');
        setQuickQuantity('1');
        await loadProducts(); // Atnaujiname likučius/prekes
      } else {
        alert('Klaida išsaugant čekį: ' + (result.error || 'Nezinoma klaida'));
      }
    } catch (error) {
      console.error(error);
      alert('Įvyko apmokėjimo klaida.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!quickName || !quickPrice) return;

    const priceNum = parseFloat(quickPrice);
    const qtyNum = parseInt(quickQuantity) || 1;

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Įveskite teisingą kainą.');
      return;
    }

    const customItem: CartItem = {
      id: 'quick-' + Date.now(),
      name: quickName,
      price: priceNum,
      quantity: qtyNum,
      vatRate: 21,
    };

    await processCheckout([customItem]);
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Viršutinė juosta */}
      <header className="max-w-7xl mx-auto w-full bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl px-6 py-4 mb-6 flex justify-between items-center border border-slate-700/60">
        <div className="flex items-center gap-3.5">
          <div className="bg-indigo-600 text-white px-3.5 py-2 rounded-xl font-extrabold shadow-lg shadow-indigo-500/30 text-sm tracking-wider">
            i.EKA
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">Moderni Kasos Aplikacija (Web Admin)</h1>
            <p className="text-xs text-slate-400">Terminalas #01 • Valdymo skydas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            i.EKA Ryšys aktyvus
          </span>
        </div>
      </header>

      {/* Pagrindinis turinys */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        
        {/* Kairė pusė: Katalogas / Greitasis pardavimas */}
        <div className="lg:col-span-2 bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/60 flex flex-col justify-between min-h-[580px]">
          <div>
            {/* Skirtukai */}
            <div className="flex gap-2 mb-6 bg-slate-900/60 p-1.5 rounded-xl w-fit border border-slate-700/50">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Prekių Katalogas
              </button>
              <button
                onClick={() => setActiveTab('quick')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'quick'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Greitasis Pardavimas (Rankinis)
              </button>
            </div>

            {/* Sėkmės pranešimas */}
            {successMessage && (
              <div className="mb-4 p-4 bg-emerald-500/10 text-emerald-300 rounded-xl font-medium border border-emerald-500/20 text-sm shadow-sm flex items-center gap-2">
                <span>{successMessage}</span>
              </div>
            )}

            {/* Turinys pagal pasirinktą skirtuką */}
            {activeTab === 'catalog' ? (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">Pasirinkite prekę</h2>
                {products.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-sm">
                    <p>Prekių nerasta. Pridėkite prekę žemiau arba naudokite „Greitąjį pardavimą“.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="p-4 rounded-xl border border-slate-700/60 bg-slate-900/40 hover:bg-indigo-600/10 hover:border-indigo-500/50 transition text-left flex flex-col justify-between shadow-sm cursor-pointer group"
                      >
                        <div>
                          <h3 className="font-semibold text-slate-200 group-hover:text-indigo-300 line-clamp-1 text-sm">{product.name}</h3>
                          <p className="text-[11px] text-slate-500 mt-1">Likutis: {product.stock} vnt.</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="font-bold text-indigo-400 text-base">€{product.price.toFixed(2)}</span>
                          <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition text-xs font-bold">+</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-md bg-slate-900/40 p-6 rounded-2xl border border-slate-700/60">
                <h2 className="text-sm font-bold text-slate-200 mb-1">Greitasis čekio suformavimas</h2>
                <p className="text-xs text-slate-400 mb-4">Įveskite pavadinimą, sumą ir kiekį bei iš karto įvykdykite apmokėjimą.</p>
                
                <form onSubmit={handleQuickPayment} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Pavadinimas</label>
                    <input 
                      type="text" 
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder="Pvz.: Prekė / Paslauga" 
                      required 
                      className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Suma (€)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={quickPrice}
                        onChange={(e) => setQuickPrice(e.target.value)}
                        placeholder="0.00" 
                        required 
                        className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Kiekis (vnt.)</label>
                      <input 
                        type="number" 
                        value={quickQuantity}
                        onChange={(e) => setQuickQuantity(e.target.value)}
                        min="1"
                        required 
                        className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Apdorojama...' : 'Mokėti iš karto (NFC / i.EKA)'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Naujos prekės pridėjimas katalogui */}
          {activeTab === 'catalog' && (
            <div className="mt-8 pt-5 border-t border-slate-700/60">
              <details className="group">
                <summary className="text-xs font-bold text-indigo-400 cursor-pointer hover:underline list-none flex items-center gap-1.5">
                  <span>+ Pridėti naują prekę į nuolatinį katalogą</span>
                </summary>
                <form 
                  action={async (formData) => {
                    await createProduct(formData);
                    await loadProducts();
                  }} 
                  className="flex gap-2.5 flex-wrap mt-3 pt-1"
                >
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Pavadinimas" 
                    required 
                    className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl flex-1 min-w-[140px] text-xs text-slate-100 placeholder:text-slate-600"
                  />
                  <input 
                    type="number" 
                    step="0.01" 
                    name="price" 
                    placeholder="Kaina (€)" 
                    required 
                    className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl w-24 text-xs text-slate-100 placeholder:text-slate-600"
                  />
                  <input 
                    type="number" 
                    name="stock" 
                    placeholder="Kiekis" 
                    defaultValue="10" 
                    className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl w-20 text-xs text-slate-100 placeholder:text-slate-600"
                  />
                  <button 
                    type="submit" 
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Išsaugoti
                  </button>
                </form>
              </details>
            </div>
          )}
        </div>

        {/* Dešinė pusė: Krepšelis ir mokėjimas */}
        <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/60 flex flex-col justify-between min-h-[580px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-100">Krepšelis</h2>
              <span className="bg-slate-900/80 text-slate-300 border border-slate-700/60 px-3 py-1 rounded-full text-xs font-semibold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} vnt.
              </span>
            </div>
            
            {cart.length === 0 ? (
              <div className="border border-dashed border-slate-700/60 rounded-xl p-8 my-4 text-center text-slate-500 text-sm flex flex-col items-center justify-center min-h-[260px]">
                <p>Krepšelis tuščias</p>
                <span className="text-xs text-slate-600 mt-1">Spauskite prekes kairėje arba naudokite greitąjį įvedimą</span>
              </div>
            ) : (
              <div className="border-t border-slate-700/60 divide-y divide-slate-700/40 max-h-[320px] overflow-y-auto my-2 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-slate-200">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.quantity} vnt. × €{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-100">€{(item.quantity * item.price).toFixed(2)}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-500 hover:text-rose-400 font-bold px-1.5 transition text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-700/60">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-slate-400">Mokėtinai viso:</span>
              <span className="text-2xl font-black text-indigo-400">€{totalAmount.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={() => processCheckout(cart)}
              disabled={cart.length === 0 || loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition text-sm shadow-lg cursor-pointer ${
                cart.length === 0 || loading 
                  ? 'bg-slate-700/50 text-slate-500 shadow-none cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {loading ? 'Apdorojamas mokėjimas...' : 'Mokėti kortele (NFC) / i.EKA'}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2.5">
              Sėkmingai patvirtinus, duomenys iškart iškeliaus į VMI sistemą.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}