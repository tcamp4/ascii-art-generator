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
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const handleClear = () => {
    setImage(null);
    setAscii('');
    setDisplayedAscii('');
    setPrompt('');
    setPreviewUrl(null);
  };

  
const generateImage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
  
      const imageBlob = await response.blob();
      const file = new File([imageBlob], 'generated-image.png', { type: 'image/png' });
      setPreviewUrl(URL.createObjectURL(file));
      setImage(file);
      const result = await processImage(file);
      if (isTyping) {
        typeWriter(result);
      } else {
        setDisplayedAscii(result);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    }
    setIsGenerating(false);
  };

  const downloadAscii = () => {
    const element = document.createElement('a');
    const file = new Blob([displayedAscii], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'ascii-art.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  const downloadImage = () => {
    if (previewUrl) {
      const element = document.createElement('a');
      element.href = previewUrl;
      element.download = image instanceof File ? image.name : 'generated-image.png';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
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
      setPreviewUrl(URL.createObjectURL(file));
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

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {isGenerating && <LoadingSpinner />}
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">ASCII Art Generator</h2>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
  
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
              />
              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isGenerating || !prompt
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
            <div className="text-gray-400 text-sm">
              Or upload your own image:
            </div>
          </div>
          
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
            
            {/* Add this before the Output section */}
{previewUrl && (
  <div className="mt-6 p-4 bg-gray-700 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white font-bold">Original Image</h3>
      <button
        onClick={downloadImage}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Download Image
      </button>
    </div>
    <img 
      src={previewUrl} 
      alt="Original" 
      className="max-h-64 mx-auto rounded-lg shadow-lg object-contain"
    />
  </div>
)}

{/* Modify your Output section to include the download button */}
<div className="mt-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-white font-bold">ASCII Output</h3>
    {displayedAscii && (
      <button
        onClick={downloadAscii}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Download ASCII
      </button>
    )}
  </div>
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