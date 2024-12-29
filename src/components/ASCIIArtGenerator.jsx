"use client";

import React, { useState } from 'react';

const ASCIIArtGenerator = () => {
  const [image, setImage] = useState(null);
  const [ascii, setAscii] = useState('');
  const [displayedAscii, setDisplayedAscii] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [settings, setSettings] = useState({
    characters: " .,-~:;=*!#$@",
    width: 100,
    inverted: false,
    colorMode: 'none'  // 'none', 'grayscale', or 'rgb'
  });

  const characterSets = {
    simple: " .,-~:;=*!#$@",
    detailed: " .'`,^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    contrast: " .,:;|=+*#@",
    blocks: "█▓▒░ ",
    braille: "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏"
  };

  const processImage = async (file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const ratio = img.height / img.width;
    const width = settings.width;
    const height = Math.floor(width * ratio);
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    return convertToAscii(imageData);
  };

  const convertToAscii = (imageData) => {
    const chars = settings.characters.split('');
    if (settings.inverted) chars.reverse();
    
    let ascii = '';
    for (let i = 0; i < imageData.height; i++) {
      for (let j = 0; j < imageData.width; j++) {
        const idx = (i * imageData.width + j) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        
        const brightness = (r + g + b) / 3;
        const charIndex = Math.floor(brightness / 255 * (chars.length - 1));
        
        if (settings.colorMode === 'none') {
          ascii += chars[charIndex];
        } else if (settings.colorMode === 'grayscale') {
          const gray = Math.floor(brightness);
          ascii += `<span style="color: rgb(${gray},${gray},${gray})">${chars[charIndex]}</span>`;
        } else if (settings.colorMode === 'rgb') {
          ascii += `<span style="color: rgb(${r},${g},${b})">${chars[charIndex]}</span>`;
        }
      }
      ascii += '\n';
    }
    
    return ascii;
  };

  const typeWriter = async (text) => {
    setIsTyping(true);
    setDisplayedAscii('');
    
    // For colored modes, we need to count differently
    const isColored = settings.colorMode !== 'none';
    const visibleCharsPerFrame = 200;
    const frameDelay = 1000 / 30;
    
    let currentText = '';
    let visibleLength = 0;
    let chunks = text.split('\n');

    for (let row = 0; row < chunks.length; row++) {
        const currentRow = chunks.slice(0, row + 1).join('\n');
        // For colored modes, count only the actual characters, not the HTML
        const currentVisible = isColored ? 
            currentRow.replace(/<[^>]+>/g, '').length :
            currentRow.length;
            
        if (currentVisible - visibleLength > visibleCharsPerFrame) {
            await new Promise(resolve => setTimeout(resolve, frameDelay));
            visibleLength = currentVisible;
        }
        currentText = currentRow;
        setDisplayedAscii(currentText);
    }
    
    setDisplayedAscii(text);
    setIsTyping(false);
};
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const result = await processImage(file);
      setAscii(result);
      
      if (isTyping) {
        typeWriter(result, settings.typingSpeed);
      } else {
        setDisplayedAscii(result);
      }
    }
  };

  const reprocessImage = async () => {
    if (image) {
      const result = await processImage(image);
      if (isTyping) {
        typeWriter(result, settings.typingSpeed);
      } else {
        setDisplayedAscii(result);
      }
    }
  };

  // In the return statement, update the outer containers:
return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">ASCII Art Generator</h2>
          
          <div className="space-y-6">
            {/* File upload section */}
            <div className="flex gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-3 border rounded bg-gray-700 text-white border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
              <button
                onClick={reprocessImage}
                disabled={!image}
                className={`px-6 py-3 rounded-lg font-medium ${
                  image 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Reprocess
              </button>
            </div>
            
            {/* Controls section */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-white">Character Set</label>
                <select
                  value={settings.characters}
                  onChange={(e) => setSettings({...settings, characters: e.target.value})}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                >
                  {Object.entries(characterSets).map(([name, chars]) => (
                    <option key={name} value={chars}>{name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-2 text-white">Color Mode</label>
                <select
                  value={settings.colorMode}
                  onChange={(e) => setSettings({...settings, colorMode: e.target.value})}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                >
                  <option value="none">No Color</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="rgb">True Color</option>
                </select>
              </div>
            </div>
            
            {/* Checkboxes section */}
            <div className="flex items-center gap-8 justify-center">
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={settings.inverted}
                  onChange={(e) => setSettings({...settings, inverted: e.target.checked})}
                  className="mr-2 w-4 h-4 rounded"
                />
                Invert Colors
              </label>
              
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={isTyping}
                  onChange={(e) => setIsTyping(e.target.checked)}
                  className="mr-2 w-4 h-4 rounded"
                />
                Typing Effect
              </label>
            </div>
            
            {/* Output section */}
            <div className="mt-6">
              {settings.colorMode === 'none' ? (
                <pre 
                  className="font-mono text-xs whitespace-pre overflow-x-auto p-6 rounded-lg bg-black text-green-500 shadow-lg"
                  style={{ lineHeight: '1.2' }}
                >
                  {displayedAscii}
                </pre>
              ) : (
                <pre 
                  className="font-mono text-xs whitespace-pre overflow-x-auto p-6 rounded-lg bg-black shadow-lg"
                  style={{ lineHeight: '1.2' }}
                  dangerouslySetInnerHTML={{ __html: displayedAscii }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASCIIArtGenerator;