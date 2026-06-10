'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface SnippetDisplayProps {
  snippetKey: string
  isVerified: boolean
  projectId: string
}

export function SnippetDisplay({ snippetKey, isVerified, projectId }: SnippetDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const snippet = snippetKey
    ? `<script>
  (function(k){
    var s=document.createElement('script');
    s.src='${appUrl}/api/snippet?key='+k;
    s.async=true;
    document.head.appendChild(s);
  })('${snippetKey}');
</script>`
    : '<!-- Create a project first to get your snippet -->'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      toast.success('Snippet copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleVerify = async () => {
    if (!projectId) return
    setVerifying(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/verify`, { method: 'POST' })
      if (res.ok) {
        toast.success('Site verified!')
        window.location.reload()
      } else {
        toast.error("Couldn't detect the script. Make sure you've added it to your site.")
      }
    } catch {
      toast.error('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#273449]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] px-4 py-2">
          <span className="text-xs font-medium text-[#64748B]">HTML</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[#64748B] hover:bg-[#E2E8F0] transition-colors dark:hover:bg-[#334155]"
            aria-label="Copy snippet"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="overflow-x-auto p-4 text-xs text-[#0F172A] dark:text-[#F1F5F9] font-mono leading-relaxed">
          {snippet}
        </pre>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748B]">Status:</span>
          <Badge variant={isVerified ? 'success' : 'default'}>
            {isVerified ? 'Verified' : 'Pending verification'}
          </Badge>
        </div>
        {!isVerified && snippetKey && (
          <Button
            variant="outline"
            size="sm"
            loading={verifying}
            onClick={handleVerify}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Verify installation
          </Button>
        )}
      </div>
    </div>
  )
}
