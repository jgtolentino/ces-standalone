'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'
import ChatSidebar from '@/components/ChatSidebar'
import { FileText, Plus, X } from 'lucide-react'

interface Tab {
  id: string
  name: string
  content: string
  language: string
}

export default function Home() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', name: 'main.ts', content: '// Welcome to Local Cursor\nconsole.log("Hello, AI!");', language: 'typescript' }
  ])
  const [activeTab, setActiveTab] = useState('1')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  const createNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      name: `untitled-${tabs.length + 1}.ts`,
      content: '',
      language: 'typescript'
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTab.id)
  }

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId)
    setTabs(newTabs)
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id)
    }
  }

  const updateTabContent = (content: string | undefined) => {
    if (content === undefined) return
    setTabs(tabs.map(tab => 
      tab.id === activeTab ? { ...tab, content } : tab
    ))
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'mr-96' : ''}`}>
        {/* Tab Bar */}
        <div className="flex items-center bg-gray-800 border-b border-gray-700 px-2 py-1">
          <div className="flex-1 flex items-center gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-sm
                  ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <FileText size={14} />
                <span>{tab.name}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id)
                    }}
                    className="ml-1 hover:bg-gray-600 rounded p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={createNewTab}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-2 px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          >
            {isSidebarOpen ? 'Hide AI' : 'Show AI'}
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1">
          {activeTabData && (
            <Editor
              height="100%"
              defaultLanguage={activeTabData.language}
              value={activeTabData.content}
              onChange={updateTabContent}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {isSidebarOpen && (
        <ChatSidebar 
          currentCode={activeTabData?.content || ''}
          currentFile={activeTabData?.name || ''}
          onCodeUpdate={updateTabContent}
        />
      )}
    </div>
  )
}