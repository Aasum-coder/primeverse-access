'use client'
import { useState, useCallback, useRef, useEffect, useMemo, DragEvent } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */
interface WorkflowCanvasProps {
  distributor: any
  supabase: any
  workflow: any | null
  templates: any[]
  workflows: any[]
  t: Record<string, any>
  lang: string
  onBack: () => void
  onSaved: () => void
  showToast: (msg: string, type?: 'error' | 'info') => void
}

interface NodeData {
  label: string
  nodeType: string
  config: Record<string, any>
  [key: string]: unknown
}

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */
const TRIGGER_TYPES = [
  { id: 'lead_signup', label: 'Lead Signup', icon: '👤' },
  { id: 'lead_inactive', label: 'Lead Inactive', icon: '💤' },
  { id: 'stage_change', label: 'Stage Change', icon: '📊' },
  { id: 'manual', label: 'Manual Enrollment', icon: '✋' },
  { id: 'scheduled', label: 'Scheduled', icon: '📅' },
  { id: 'form_submitted', label: 'Form Submitted', icon: '📝' },
  { id: 'email_verified', label: 'Email Verified', icon: '✉️' },
  { id: 'uid_submitted', label: 'UID Submitted', icon: '🔑' },
  { id: 'uid_verified', label: 'UID Verified', icon: '✅' },
]

const ACTION_TYPES = [
  { id: 'email', label: 'Send Email', icon: '📧' },
  { id: 'whatsapp', label: 'Send WhatsApp', icon: '💬' },
  { id: 'telegram', label: 'Send Telegram', icon: '✈️' },
  { id: 'wait', label: 'Wait', icon: '⏳' },
  { id: 'update_field', label: 'Update Field', icon: '✏️' },
  { id: 'move_stage', label: 'Move Pipeline Stage', icon: '📊' },
  { id: 'add_tag', label: 'Add Tag', icon: '🏷️' },
  { id: 'notify_admin', label: 'Notify Admin', icon: '🔔' },
  { id: 'in_app_notification', label: 'In-App Notification', icon: '📱' },
]

const CONDITION_TYPES = [
  { id: 'condition', label: 'If/Else', icon: '🔀' },
]

const FLOW_CONTROL_TYPES = [
  { id: 'switch_workflow', label: 'Switch Workflow', icon: '🔄' },
  { id: 'stop', label: 'Stop/End', icon: '🛑' },
  { id: 'goto', label: 'Go To Step', icon: '↩️' },
]

const MERGE_TAGS = ['{first_name}', '{landing_page_url}', '{referral_link}']

const PIPELINE_STAGES = ['New', 'Contacted', 'Interested', 'Signed Up', 'Active', 'VIP']

/* ═══════════════════════════════════════════════════════════════════════
   NODE STYLES
   ═══════════════════════════════════════════════════════════════════════ */
const nodeBase: React.CSSProperties = {
  background: '#16213E',
  borderRadius: 10,
  padding: '12px 16px',
  minWidth: 200,
  fontSize: '0.82rem',
  color: '#FFFFFF',
  fontFamily: 'Arial, sans-serif',
}

const handleStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  background: '#D4A843',
  border: '2px solid #1A1A2E',
}

/* ═══════════════════════════════════════════════════════════════════════
   CUSTOM NODES
   ═══════════════════════════════════════════════════════════════════════ */
function TriggerNode({ data, selected }: { data: NodeData; selected?: boolean }) {
  const triggerInfo = TRIGGER_TYPES.find(t => t.id === data.config?.triggerType) || TRIGGER_TYPES[0]
  return (
    <div style={{ ...nodeBase, border: `2px solid ${selected ? '#e6c468' : '#D4A843'}`, boxShadow: selected ? '0 0 20px rgba(212,168,67,0.4)' : '0 2px 8px rgba(0,0,0,0.3)', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213E 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: '1.1rem' }}>{triggerInfo.icon}</span>
        <span style={{ fontWeight: 700, color: '#D4A843', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trigger</span>
      </div>
      <div style={{ fontWeight: 600 }}>{triggerInfo.label}</div>
      {data.config?.triggerType === 'lead_inactive' && data.config?.days && (
        <div style={{ color: '#999', fontSize: '0.75rem', marginTop: 4 }}>After {data.config.days} days</div>
      )}
      {data.config?.triggerType === 'stage_change' && data.config?.stage && (
        <div style={{ color: '#999', fontSize: '0.75rem', marginTop: 4 }}>Stage: {data.config.stage}</div>
      )}
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

function ActionNode({ data, selected }: { data: NodeData; selected?: boolean }) {
  const actionInfo = ACTION_TYPES.find(a => a.id === data.nodeType) || { label: data.nodeType, icon: '⚡' }
  let preview = ''
  if (data.nodeType === 'email' && data.config?.subject) preview = data.config.subject
  else if (data.nodeType === 'wait') preview = `Wait ${data.config?.value || 1} ${data.config?.unit || 'days'}`
  else if (data.nodeType === 'whatsapp' && data.config?.message) preview = data.config.message.substring(0, 40) + '...'
  else if (data.nodeType === 'telegram' && data.config?.message) preview = data.config.message.substring(0, 40) + '...'
  else if (data.nodeType === 'move_stage') preview = `Move to: ${data.config?.stage || '...'}`
  else if (data.nodeType === 'add_tag') preview = `Tag: ${data.config?.tag || '...'}`
  else if (data.nodeType === 'update_field') preview = `${data.config?.field || '...'} = ${data.config?.value || '...'}`

  return (
    <div style={{ ...nodeBase, border: `2px solid ${selected ? '#e6c468' : '#2a2a4a'}`, boxShadow: selected ? '0 0 20px rgba(212,168,67,0.3)' : '0 2px 8px rgba(0,0,0,0.2)', borderLeft: '4px solid #D4A843' }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: '1rem' }}>{actionInfo.icon}</span>
        <span style={{ fontWeight: 600 }}>{actionInfo.label}</span>
      </div>
      {preview && <div style={{ color: '#AAAAAA', fontSize: '0.75rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{preview}</div>}
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

function ConditionNode({ data, selected }: { data: NodeData; selected?: boolean }) {
  const condLabel = data.config?.conditionType === 'opened' ? 'Opened email' : data.config?.conditionType === 'clicked' ? 'Clicked email' : data.config?.conditionType === 'not_opened' ? "Didn't open email" : data.config?.conditionType === 'field_equals' ? `${data.config?.field} = ${data.config?.value}` : data.config?.conditionType === 'days_since' ? `Days > ${data.config?.days}` : data.config?.conditionType === 'stage_is' ? `Stage is ${data.config?.stage}` : 'If / Else'
  return (
    <div style={{ ...nodeBase, border: `2px solid ${selected ? '#e6c468' : '#D4A843'}`, boxShadow: selected ? '0 0 20px rgba(212,168,67,0.4)' : '0 2px 8px rgba(0,0,0,0.3)', borderRadius: 12, background: '#16213E', minWidth: 180, textAlign: 'center', clipPath: 'none' }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: '1rem' }}>🔀</span>
        <span style={{ fontWeight: 700, color: '#D4A843', fontSize: '0.78rem', textTransform: 'uppercase' }}>Condition</span>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#E0E0E0' }}>{condLabel}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '0 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 700 }}>YES</span>
          <Handle type="source" position={Position.Bottom} id="yes" style={{ ...handleStyle, background: '#4ade80', position: 'relative', left: -30 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700 }}>NO</span>
          <Handle type="source" position={Position.Bottom} id="no" style={{ ...handleStyle, background: '#f87171', position: 'relative', left: 30 }} />
        </div>
      </div>
    </div>
  )
}

function FlowControlNode({ data, selected }: { data: NodeData; selected?: boolean }) {
  const info = FLOW_CONTROL_TYPES.find(f => f.id === data.nodeType) || { label: data.nodeType, icon: '⚡' }
  return (
    <div style={{ ...nodeBase, border: `2px solid ${selected ? '#e6c468' : '#555'}`, boxShadow: selected ? '0 0 20px rgba(212,168,67,0.3)' : '0 2px 8px rgba(0,0,0,0.2)', borderStyle: 'dashed', opacity: data.nodeType === 'stop' ? 0.8 : 1 }}>
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1rem' }}>{info.icon}</span>
        <span style={{ fontWeight: 600 }}>{info.label}</span>
      </div>
      {data.nodeType === 'switch_workflow' && data.config?.targetName && (
        <div style={{ color: '#AAAAAA', fontSize: '0.75rem', marginTop: 4 }}>→ {data.config.targetName}</div>
      )}
      {data.nodeType !== 'stop' && (
        <Handle type="source" position={Position.Bottom} style={handleStyle} />
      )}
    </div>
  )
}

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  flowControl: FlowControlNode,
}

/* ═══════════════════════════════════════════════════════════════════════
   HELPER: get node category
   ═══════════════════════════════════════════════════════════════════════ */
function getNodeCategory(typeId: string): string {
  if (TRIGGER_TYPES.some(t => t.id === typeId)) return 'trigger'
  if (CONDITION_TYPES.some(c => c.id === typeId)) return 'condition'
  if (FLOW_CONTROL_TYPES.some(f => f.id === typeId)) return 'flowControl'
  return 'action'
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CANVAS (inner, needs ReactFlowProvider)
   ═══════════════════════════════════════════════════════════════════════ */
function WorkflowCanvasInner({
  distributor, supabase, workflow, templates, workflows, t, lang, onBack, onSaved, showToast,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  // ── State ──
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [wfName, setWfName] = useState(workflow?.name || '')
  const [wfStatus, setWfStatus] = useState<string>(workflow?.status || 'draft')
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [canvasMessage, setCanvasMessage] = useState<{ text: string; type: 'error' | 'warning' } | null>(null)
  const lastSavedRef = useRef<string>('')

  // ── Mobile detection ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Load workflow ──
  useEffect(() => {
    if (!workflow?.id) {
      // New workflow: add default trigger node
      const triggerNode: Node = {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 300, y: 50 },
        data: { label: 'Trigger', nodeType: 'trigger', config: { triggerType: 'lead_signup' } },
      }
      setNodes([triggerNode])
      setEdges([])
      return
    }
    // Load existing workflow steps
    const load = async () => {
      const { data: steps } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflow.id)
        .order('step_order', { ascending: true })
      if (!steps || steps.length === 0) {
        const triggerNode: Node = {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 300, y: 50 },
          data: { label: 'Trigger', nodeType: 'trigger', config: { triggerType: workflow.trigger_type || 'lead_signup', ...(workflow.trigger_config || {}) } },
        }
        setNodes([triggerNode])
        return
      }
      // Reconstruct nodes and edges from steps
      const loadedNodes: Node[] = []
      const loadedEdges: Edge[] = []
      // Add trigger node
      loadedNodes.push({
        id: 'trigger-1',
        type: 'trigger',
        position: steps[0]?.config?.position || { x: 300, y: 50 },
        data: { label: 'Trigger', nodeType: 'trigger', config: { triggerType: workflow.trigger_type || 'lead_signup', ...(workflow.trigger_config || {}), position: undefined } },
      })
      steps.forEach((step: any, i: number) => {
        // Restore the real nodeType from config._nodeType if it was mapped for DB constraint
        const realNodeType = step.config?._nodeType || step.step_type
        const cat = getNodeCategory(realNodeType)
        const nodeId = `step-${step.id || i}`
        const pos = step.config?.position || { x: 300, y: 150 + i * 120 }
        const { _nodeType: _, position: _pos, ...cleanConfig } = step.config || {}
        loadedNodes.push({
          id: nodeId,
          type: cat,
          position: pos,
          data: { label: realNodeType, nodeType: realNodeType, config: cleanConfig },
        })
        // Build edges from connections stored in config
        if (step.config?.connections) {
          const conn = step.config.connections
          if (conn.default) loadedEdges.push({ id: `e-${nodeId}-${conn.default}`, source: nodeId, target: conn.default, style: { stroke: '#D4A843', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#D4A843' } })
          if (conn.yes) loadedEdges.push({ id: `e-${nodeId}-yes-${conn.yes}`, source: nodeId, sourceHandle: 'yes', target: conn.yes, style: { stroke: '#4ade80', strokeWidth: 2, strokeDasharray: '5 5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#4ade80' } })
          if (conn.no) loadedEdges.push({ id: `e-${nodeId}-no-${conn.no}`, source: nodeId, sourceHandle: 'no', target: conn.no, style: { stroke: '#f87171', strokeWidth: 2, strokeDasharray: '5 5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f87171' } })
        } else if (i === 0) {
          // First step connects from trigger
          loadedEdges.push({ id: `e-trigger-${nodeId}`, source: 'trigger-1', target: nodeId, style: { stroke: '#D4A843', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#D4A843' } })
        } else {
          // Sequential connection
          const prevId = `step-${steps[i - 1].id || (i - 1)}`
          if (steps[i - 1].step_type !== 'condition') {
            loadedEdges.push({ id: `e-${prevId}-${nodeId}`, source: prevId, target: nodeId, style: { stroke: '#D4A843', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#D4A843' } })
          }
        }
      })
      setNodes(loadedNodes)
      setEdges(loadedEdges)
    }
    load()
  }, [workflow?.id])

  // ── Auto-save (every 30s if dirty) ──
  useEffect(() => {
    if (!dirty || !workflow?.id) return
    const timer = setTimeout(() => { handleSave(false) }, 30000)
    return () => clearTimeout(timer)
  }, [dirty, nodes, edges])

  // ── Mark dirty on changes ──
  useEffect(() => {
    const sig = JSON.stringify({ nodes: nodes.map(n => ({ id: n.id, pos: n.position, data: n.data })), edges: edges.map(e => ({ id: e.id, s: e.source, t: e.target })) })
    if (lastSavedRef.current && sig !== lastSavedRef.current) setDirty(true)
    lastSavedRef.current = sig
  }, [nodes, edges])

  // ── Connection handler ──
  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find(n => n.id === params.source)
    let style: Record<string, any> = { stroke: '#D4A843', strokeWidth: 2 }
    let marker: any = { type: MarkerType.ArrowClosed, color: '#D4A843' }
    if (params.sourceHandle === 'yes') {
      style = { stroke: '#4ade80', strokeWidth: 2, strokeDasharray: '5 5' }
      marker = { type: MarkerType.ArrowClosed, color: '#4ade80' }
    } else if (params.sourceHandle === 'no') {
      style = { stroke: '#f87171', strokeWidth: 2, strokeDasharray: '5 5' }
      marker = { type: MarkerType.ArrowClosed, color: '#f87171' }
    }
    setEdges(eds => addEdge({ ...params, style, markerEnd: marker, id: `e-${params.source}-${params.sourceHandle || 'default'}-${params.target}` }, eds))
    setDirty(true)
  }, [nodes, setEdges])

  // ── Drag and drop from sidebar ──
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: DragEvent) => {
    event.preventDefault()
    const typeId = event.dataTransfer.getData('application/reactflow')
    if (!typeId) return
    const cat = getNodeCategory(typeId) 
    if (cat === 'trigger' && nodes.some(n => n.type === 'trigger')) {
      setCanvasMessage({ text: 'A workflow can only have one trigger', type: 'error' })
      setTimeout(() => setCanvasMessage(null), 3000)
      return
    }
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })

    const id = `${typeId}-${Date.now()}`
    const allTypes = [...TRIGGER_TYPES, ...ACTION_TYPES, ...CONDITION_TYPES, ...FLOW_CONTROL_TYPES]
    const info = allTypes.find(t => t.id === typeId)
    const newNode: Node = {
      id,
      type: cat,
      position,
      data: {
        label: info?.label || typeId,
        nodeType: typeId,
        config: typeId === 'wait' ? { value: 1, unit: 'days' } : typeId === 'email' ? { subject: '', body: '' } : {},
      },
    }
    setNodes(nds => [...nds, newNode])
    setDirty(true)
  }, [screenToFlowPosition, setNodes, nodes])

  // ── Node click ──
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node as Node<NodeData>)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // ── Update node config ──
  const updateNodeConfig = useCallback((nodeId: string, newConfig: Record<string, any>) => {
    setNodes(nds => nds.map(n => {
      if (n.id !== nodeId) return n
      const d = n.data as NodeData
      return { ...n, data: { ...d, config: { ...(d.config || {}), ...newConfig } } }
    }))
    setDirty(true)
    setSelectedNode(prev => {
      if (!prev || prev.id !== nodeId) return prev
      const d = prev.data as NodeData
      return { ...prev, data: { ...d, config: { ...(d.config || {}), ...newConfig } } }
    })
  }, [setNodes])

  // ── Delete node ──
  const deleteNode = useCallback((nodeId: string) => {
    // Don't allow deleting the trigger node
    const node = nodes.find(n => n.id === nodeId)
    if (node?.type === 'trigger') {
      showToast('Cannot delete the trigger node', 'error')
      return
    }
    setNodes(nds => nds.filter(n => n.id !== nodeId))
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    setSelectedNode(null)
    setDirty(true)
  }, [nodes, setNodes, setEdges, showToast])

  // ── Keyboard delete handler ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (!selectedNode) return
      if (selectedNode.type === 'trigger') {
        setCanvasMessage({ text: 'Triggers cannot be deleted', type: 'warning' })
        setTimeout(() => setCanvasMessage(null), 3000)
        return
      }
      e.preventDefault()
      deleteNode(selectedNode.id)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, deleteNode])

  // ── Tidy up (auto-arrange) ──
  const tidyUp = useCallback(() => {
    const triggerNode = nodes.find(n => n.type === 'trigger')
    if (!triggerNode) return
    // Simple top-down layout
    const visited = new Set<string>()
    const positions: Record<string, { x: number; y: number }> = {}
    const queue: { id: string; x: number; y: number }[] = [{ id: triggerNode.id, x: 350, y: 50 }]
    let maxY = 50
    while (queue.length > 0) {
      const { id, x, y } = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)
      positions[id] = { x, y }
      maxY = Math.max(maxY, y)
      const outgoing = edges.filter(e => e.source === id)
      outgoing.forEach((e, i) => {
        const offsetX = outgoing.length > 1 ? (i - (outgoing.length - 1) / 2) * 250 : 0
        queue.push({ id: e.target, x: x + offsetX, y: y + 130 })
      })
    }
    // Place unvisited nodes
    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        maxY += 130
        positions[n.id] = { x: 350, y: maxY }
      }
    })
    setNodes(nds => nds.map(n => positions[n.id] ? { ...n, position: positions[n.id] } : n))
    setDirty(true)
  }, [nodes, edges, setNodes])

  // ── Valid step_type values (must match DB CHECK constraint) ──
  const VALID_STEP_TYPES = new Set(['email', 'wait', 'condition', 'switch_workflow', 'whatsapp', 'telegram'])

  // ── Save ──
  const handleSave = useCallback(async (activate?: boolean) => {
    if (!wfName.trim()) {
      showToast('Please enter a workflow name')
      return
    }
    setSaving(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Auth error:', authError)
        showToast('Not authenticated — please sign in again')
        setSaving(false)
        return
      }
      console.log('Saving workflow as user:', user.id)

      const triggerNode = nodes.find(n => n.type === 'trigger')
      const triggerConfig = ((triggerNode?.data as NodeData)?.config || {}) as Record<string, any>
      const triggerType = triggerConfig.triggerType || 'lead_signup'
      const { triggerType: _tt, ...restTriggerConfig } = triggerConfig

      // Store trigger position in trigger_config
      if (triggerNode) {
        restTriggerConfig.triggerPosition = triggerNode.position
      }

      const wfData: Record<string, any> = {
        owner_id: user.id,
        name: wfName.trim(),
        description: '',
        trigger_type: triggerType,
        trigger_config: restTriggerConfig,
        status: activate !== undefined ? (activate ? 'active' : 'paused') : wfStatus,
        is_template: false,
        is_global: false,
      }
      console.log('Workflow data to save:', JSON.stringify(wfData))

      let wfId: string
      if (workflow?.id) {
        const { error: updateError } = await supabase.from('email_workflows').update(wfData).eq('id', workflow.id)
        if (updateError) {
          console.error('Workflow save error:', JSON.stringify(updateError))
          showToast(t.wfSaveError || 'Failed to update workflow')
          setSaving(false)
          return
        }
        wfId = workflow.id
        console.log('Updated workflow id:', wfId)
        const { error: deleteError } = await supabase.from('workflow_steps').delete().eq('workflow_id', wfId)
        if (deleteError) console.error('Steps delete error:', JSON.stringify(deleteError))
      } else {
        const { data, error } = await supabase.from('email_workflows').insert(wfData).select('id').single()
        if (error || !data) {
          console.error('Workflow save error:', JSON.stringify(error))
          showToast(t.wfSaveError || 'Failed to save')
          setSaving(false)
          return
        }
        wfId = data.id
        console.log('Created workflow id:', wfId)
      }

      // Build steps from non-trigger nodes
      const stepNodes = nodes.filter(n => n.type !== 'trigger')
      if (stepNodes.length > 0) {
        console.log('Saving steps for workflow_id:', wfId)
        const stepsToInsert = stepNodes.map((n, i) => {
          const connections: Record<string, string> = {}
          edges.filter(e => e.source === n.id).forEach(e => {
            if (e.sourceHandle === 'yes') connections.yes = e.target
            else if (e.sourceHandle === 'no') connections.no = e.target
            else connections.default = e.target
          })
          const nd = n.data as NodeData
          // Map extended node types to valid DB step_types
          let stepType = nd.nodeType
          if (!VALID_STEP_TYPES.has(stepType)) {
            stepType = 'email' // fallback; the config carries the real type
          }
          return {
            workflow_id: wfId,
            step_order: i + 1,
            step_type: stepType,
            config: { ...(nd.config || {}), _nodeType: nd.nodeType, position: n.position, connections },
          }
        })
        const { error: stepsError } = await supabase.from('workflow_steps').insert(stepsToInsert)
        if (stepsError) console.error('Workflow save error:', JSON.stringify(stepsError))
      }

      if (activate !== undefined) setWfStatus(activate ? 'active' : 'paused')
      setDirty(false)
      showToast(activate ? (t.wfActivated || 'Workflow activated!') : (t.wfSaved || 'Workflow saved!'), 'info')
      onSaved()
    } catch (err) {
      console.error('Workflow save error:', err)
      showToast(t.wfSaveError || 'Failed to save workflow')
    }
    setSaving(false)
  }, [wfName, wfStatus, nodes, edges, workflow, supabase, showToast, t, onSaved])

  // ── Use template ──
  const useTemplate = useCallback(async (template: any) => {
    const steps = (template.workflow_steps || []).sort((a: any, b: any) => a.step_order - b.step_order)
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    // Trigger
    newNodes.push({
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: { label: 'Trigger', nodeType: 'trigger', config: { triggerType: template.trigger_type || 'lead_signup', ...(template.trigger_config || {}) } },
    })
    steps.forEach((step: any, i: number) => {
      const cat = getNodeCategory(step.step_type)
      const nodeId = `tpl-${i}`
      newNodes.push({
        id: nodeId,
        type: cat,
        position: step.config?.position || { x: 350, y: 180 + i * 120 },
        data: { label: step.step_type, nodeType: step.step_type, config: { ...step.config, position: undefined, connections: undefined } },
      })
      if (i === 0) {
        newEdges.push({ id: `e-trigger-${nodeId}`, source: 'trigger-1', target: nodeId, style: { stroke: '#D4A843', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#D4A843' } })
      } else {
        const prevId = `tpl-${i - 1}`
        newEdges.push({ id: `e-${prevId}-${nodeId}`, source: prevId, target: nodeId, style: { stroke: '#D4A843', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#D4A843' } })
      }
    })
    setNodes(newNodes)
    setEdges(newEdges)
    setWfName(template.name || '')
    setDirty(true)
    setTemplatesOpen(false)
    showToast(t.wfTemplateUsed || 'Template loaded!', 'info')
  }, [setNodes, setEdges, showToast, t])

  // ── MOBILE VIEW ──
  if (isMobile) {
    const stepNodes = nodes.filter(n => n.type !== 'trigger')
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#D4A843', cursor: 'pointer', fontSize: '0.88rem' }}>← {t.wfBackToWorkflows || 'Back'}</button>
          <span style={{ fontWeight: 700, color: '#E0E0E0', flex: 1 }}>{wfName || 'New Workflow'}</span>
        </div>
        <p style={{ color: '#888', fontSize: '0.82rem', marginBottom: 16 }}>Visual workflow editor requires a desktop browser. Showing step list:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {nodes.find(n => n.type === 'trigger') && (
            <div style={{ background: '#16213E', border: '2px solid #D4A843', borderRadius: 8, padding: 12 }}>
              <span style={{ color: '#D4A843', fontWeight: 700 }}>Trigger: </span>
              <span style={{ color: '#E0E0E0' }}>{TRIGGER_TYPES.find(tt => tt.id === (nodes[0]?.data as NodeData)?.config?.triggerType)?.label || 'Unknown'}</span>
            </div>
          )}
          {stepNodes.map((n, i) => (
            <div key={n.id} style={{ background: '#16213E', border: '1px solid #2a2a4a', borderRadius: 8, padding: 12, borderLeft: '3px solid #D4A843' }}>
              <span style={{ color: '#D4A843', fontWeight: 600, fontSize: '0.78rem' }}>Step {i + 1}: </span>
              <span style={{ color: '#E0E0E0' }}>{ACTION_TYPES.find(a => a.id === (n.data as NodeData).nodeType)?.label || FLOW_CONTROL_TYPES.find(f => f.id === (n.data as NodeData).nodeType)?.label || (n.data as NodeData).nodeType}</span>
              {(n.data as NodeData).nodeType === 'email' && (n.data as NodeData).config?.subject && <div style={{ color: '#888', fontSize: '0.75rem', marginTop: 4 }}>{(n.data as NodeData).config.subject}</div>}
              {(n.data as NodeData).nodeType === 'wait' && <div style={{ color: '#888', fontSize: '0.75rem', marginTop: 4 }}>Wait {(n.data as NodeData).config?.value || 1} {(n.data as NodeData).config?.unit || 'days'}</div>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => handleSave(false)} disabled={saving} style={{ flex: 1, background: '#2a2a4a', color: '#E0E0E0', border: '1px solid #3a3a5a', borderRadius: 6, padding: '10px', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : (t.wfSaveDraft || 'Save Draft')}</button>
          <button onClick={() => handleSave(true)} disabled={saving} style={{ flex: 1, background: '#D4A843', color: '#1A1A2E', border: 'none', borderRadius: 6, padding: '10px', fontWeight: 700, cursor: 'pointer' }}>{t.wfActivate || 'Activate'}</button>
        </div>
      </div>
    )
  }

  // ── DESKTOP CANVAS VIEW ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: 500 }}>
      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#0f0f23', borderBottom: '1px solid #2a2a4a', flexShrink: 0, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#D4A843', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>← {t.wfBackToWorkflows || 'Back'}</button>
        <input
          value={wfName}
          onChange={e => { setWfName(e.target.value); setDirty(true) }}
          placeholder={t.wfWorkflowNamePh || 'Workflow name...'}
          style={{ flex: 1, minWidth: 150, background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 6, padding: '6px 12px', color: '#E0E0E0', fontSize: '0.88rem', fontWeight: 600 }}
        />
        <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, background: wfStatus === 'active' ? 'rgba(74,222,128,0.15)' : wfStatus === 'paused' ? 'rgba(248,113,113,0.15)' : 'rgba(136,136,136,0.15)', color: wfStatus === 'active' ? '#4ade80' : wfStatus === 'paused' ? '#f87171' : '#888' }}>
          {wfStatus === 'active' ? (t.wfActive || 'Active') : wfStatus === 'paused' ? (t.wfPaused || 'Paused') : (t.wfDraft || 'Draft')}
        </span>
        {dirty && <span style={{ color: '#D4A843', fontSize: '0.72rem' }}>Unsaved</span>}
        <button onClick={() => setTemplatesOpen(true)} style={{ background: '#2a2a4a', color: '#E0E0E0', border: '1px solid #3a3a5a', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem' }}>{t.wfTemplateLibrary || 'Templates'}</button>
        <button onClick={() => handleSave(false)} disabled={saving} style={{ background: '#2a2a4a', color: '#E0E0E0', border: '1px solid #3a3a5a', borderRadius: 6, padding: '6px 14px', cursor: saving ? 'wait' : 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>{saving ? '...' : (t.wfSaveDraft || 'Save')}</button>
        <button onClick={() => handleSave(wfStatus !== 'active')} disabled={saving} style={{ background: wfStatus === 'active' ? '#f87171' : '#D4A843', color: wfStatus === 'active' ? '#fff' : '#1A1A2E', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
          {wfStatus === 'active' ? (t.wfPaused || 'Pause') : (t.wfActivate || 'Activate')}
        </button>
      </div>

      {/* MAIN AREA */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDEBAR */}
        {sidebarOpen && (
          <div style={{ width: 200, background: '#0f0f23', borderRight: '1px solid #2a2a4a', overflowY: 'auto', flexShrink: 0, padding: '12px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#D4A843', fontWeight: 700, fontSize: '0.82rem' }}>Components</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
            </div>
            {[
              { title: 'Triggers', items: TRIGGER_TYPES, color: '#D4A843' },
              { title: 'Actions', items: ACTION_TYPES, color: '#4ade80' },
              { title: 'Conditions', items: CONDITION_TYPES, color: '#8b5cf6' },
              { title: 'Flow Control', items: FLOW_CONTROL_TYPES, color: '#f97316' },
            ].map(section => (
              <div key={section.title} style={{ marginBottom: 14 }}>
                <div style={{ color: section.color, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, padding: '0 4px' }}>{section.title}</div>
                {section.items.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', item.id); e.dataTransfer.effectAllowed = 'move' }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', marginBottom: 2, borderRadius: 6, cursor: 'grab', color: '#E0E0E0', fontSize: '0.78rem', background: '#16213E', border: '1px solid #1a1a2e', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#D4A843')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a2e')}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={tidyUp} style={{ width: '100%', background: '#2a2a4a', color: '#E0E0E0', border: '1px solid #3a3a5a', borderRadius: 6, padding: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, marginTop: 8 }}>Tidy Up</button>
          </div>
        )}

        {/* Toggle sidebar button when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ position: 'absolute', left: 0, top: '50%', zIndex: 10, background: '#D4A843', color: '#1A1A2E', border: 'none', borderRadius: '0 6px 6px 0', padding: '8px 4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
          >
            ▶
          </button>
        )}

        {/* CANVAS */}
        <div ref={reactFlowWrapper} style={{ flex: 1, background: '#1A1A2E', position: 'relative' }}>
          {canvasMessage && (
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: canvasMessage.type === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(212,168,67,0.15)', color: canvasMessage.type === 'error' ? '#f87171' : '#D4A843', border: `1px solid ${canvasMessage.type === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(212,168,67,0.4)'}`, borderRadius: 8, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, pointerEvents: 'none' }}>
              {canvasMessage.text}
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            deleteKeyCode={null}
            defaultEdgeOptions={{ style: { stroke: '#D4A843', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#D4A843' } }}
            style={{ background: '#1A1A2E' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2A2A4E" />
            <Controls position="bottom-left" style={{ background: '#16213E', borderRadius: 8, border: '1px solid #2a2a4a' }} />
            <MiniMap
              position="bottom-right"
              nodeColor={n => n.type === 'trigger' ? '#D4A843' : n.type === 'condition' ? '#8b5cf6' : n.type === 'flowControl' ? '#f97316' : '#4ade80'}
              maskColor="rgba(10,10,30,0.7)"
              style={{ background: '#0f0f23', borderRadius: 8, border: '1px solid #2a2a4a' }}
            />
          </ReactFlow>
        </div>

        {/* RIGHT PANEL (node config) */}
        {selectedNode && (
          <div style={{ width: 300, background: '#0f0f23', borderLeft: '1px solid #2a2a4a', overflowY: 'auto', flexShrink: 0, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#D4A843', fontWeight: 700, fontSize: '0.88rem' }}>Configure</span>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>✕</button>
            </div>

            {/* TRIGGER CONFIG */}
            {selectedNode.type === 'trigger' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ color: '#888', fontSize: '0.78rem' }}>Trigger Type</label>
                <select
                  value={selectedNode.data.config?.triggerType || 'lead_signup'}
                  onChange={e => updateNodeConfig(selectedNode.id, { triggerType: e.target.value })}
                  style={selectStyle}
                >
                  {TRIGGER_TYPES.map(tt => <option key={tt.id} value={tt.id}>{tt.icon} {tt.label}</option>)}
                </select>
                {selectedNode.data.config?.triggerType === 'lead_inactive' && (
                  <>
                    <label style={{ color: '#888', fontSize: '0.78rem' }}>Inactive Days</label>
                    <input type="number" value={selectedNode.data.config?.days || 14} onChange={e => updateNodeConfig(selectedNode.id, { days: parseInt(e.target.value) })} style={inputStyle} />
                  </>
                )}
                {selectedNode.data.config?.triggerType === 'stage_change' && (
                  <>
                    <label style={{ color: '#888', fontSize: '0.78rem' }}>Target Stage</label>
                    <select value={selectedNode.data.config?.stage || ''} onChange={e => updateNodeConfig(selectedNode.id, { stage: e.target.value })} style={selectStyle}>
                      <option value="">Select stage...</option>
                      {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </>
                )}
              </div>
            )}

            {/* EMAIL CONFIG */}
            {selectedNode.data.nodeType === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ color: '#888', fontSize: '0.78rem' }}>{t.wfSubject || 'Subject'}</label>
                <input value={selectedNode.data.config?.subject || ''} onChange={e => updateNodeConfig(selectedNode.id, { subject: e.target.value })} placeholder="Email subject..." style={inputStyle} />
                <label style={{ color: '#888', fontSize: '0.78rem' }}>{t.wfBody || 'Body'}</label>
                <textarea value={selectedNode.data.config?.body || ''} onChange={e => updateNodeConfig(selectedNode.id, { body: e.target.value })} placeholder="Email body..." rows={8} style={{ ...inputStyle, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {MERGE_TAGS.map(tag => (
                    <button key={tag} onClick={() => updateNodeConfig(selectedNode.id, { body: (selectedNode.data.config?.body || '') + ' ' + tag })} style={{ background: '#2a2a4a', color: '#D4A843', border: '1px solid #3a3a5a', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: '0.7rem' }}>{tag}</button>
                  ))}
                </div>
              </div>
            )}

            {/* WAIT CONFIG */}
            {selectedNode.data.nodeType === 'wait' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ color: '#888', fontSize: '0.78rem' }}>{t.wfWaitValue || 'Duration'}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" min={1} value={selectedNode.data.config?.value || 1} onChange={e => updateNodeConfig(selectedNode.id, { value: parseInt(e.target.value) })} style={{ ...inputStyle, flex: 1 }} />
                  <select value={selectedNode.data.config?.unit || 'days'} onChange={e => updateNodeConfig(selectedNode.id, { unit: e.target.value })} style={{ ...selectStyle, flex: 1 }}>
                    <option value="hours">{t.wfHours || 'Hours'}</option>
                    <option value="days">{t.wfDays || 'Days'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* WHATSAPP / TELEGRAM CONFIG */}
            {(selectedNode.data.nodeType === 'whatsapp' || selectedNode.data.nodeType === 'telegram') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ color: '#888', fontSize: '0.78rem' }}>Message</label>
                <textarea value={selectedNode.data.config?.message || ''} onChange={e => updateNodeConfig(selectedNode.id, { message: e.target.value })} placeholder="Message text..." rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {MERGE_TAGS.map(tag => (
                    <button key={tag} onClick={() => updateNodeConfig(selectedNode.id, { message: (selectedNode.data.config?.message || '') + ' ' + tag })} style={{ background: '#2a2a4a', color: '#D4A843', border: '1px solid #3a3a5a', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: '0.7rem' }}>{tag}</button>
                  ))}
                </div>
              </div>
            )}

            {/* CONDITION CONFIG */}
            {selectedNode.data.nodeType === 'condition' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ color: '#888', fontSize: '0.78rem' }}>Condition Type</label>
                <select value={selectedNode.data.config?.conditionType || 'opened'} onChange={e => updateNodeConfig(selectedNode.id, { conditionType: e.target.value })} style={selectStyle}>
                  <option value="opened">If lead opened email</option>
                  <option value="clicked">If lead clicked email</option>
                  <option value="not_opened">If lead didn&apos;t open email</option>
                  <option value="field_equals">If field equals value</option>
                  <option value="days_since">If days since event &gt; N</option>
                  <option value="stage_is">If pipeline stage is</option>
                </select>
                {selectedNode.data.config?.conditionType === 'field_equals' && (
                  <>
                    <input value={selectedNode.data.config?.field || ''} onChange={e => updateNodeConfig(selectedNode.id, { field: e.target.value })} placeholder="Field name" style={inputStyle} />
                    <input value={selectedNode.data.config?.value || ''} onChange={e => updateNodeConfig(selectedNode.id, { value: e.target.value })} placeholder="Value" style={inputStyle} />
                  </>
                )}
                {selectedNode.data.config?.conditionType === 'days_since' && (
                  <input type="number" value={selectedNode.data.config?.days || 7} onChange={e => updateNodeConfig(selectedNode.id, { days: parseInt(e.target.value) })} placeholder="Days" style={inputStyle} />
                )}
                {selectedNode.data.config?.conditionType === 'stage_is' && (
                  <select value={selectedNode.data.config?.stage || ''} onChange={e => updateNodeConfig(selectedNode.id, { stage: e.target.value })} style={selectStyle}>
                    <option value="">Select stage...</option>
                    {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            )}

            {/* MOVE STAGE CONFIG */}
            {selectedNode.data.nodeType === 'move_stage' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ color: '#888', fontSize: '0.78rem' }}>Target Stage</label>
                <select value={selectedNode.data.config?.stage || ''} onChange={e => updateNodeConfig(selectedNode.id, { stage: e.target.value })} style={selectStyle}>
                  <option value="">Select stage...</option>
                  {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {/* ADD TAG CONFIG */}
            {selectedNode.data.nodeType === 'add_tag' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ color: '#888', fontSize: '0.78rem' }}>Tag Name</label>
                <input value={selectedNode.data.config?.tag || ''} onChange={e => updateNodeConfig(selectedNode.id, { tag: e.target.value })} placeholder="Tag name..." style={inputStyle} />
              </div>
            )}

            {/* UPDATE FIELD CONFIG */}
            {selectedNode.data.nodeType === 'update_field' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ color: '#888', fontSize: '0.78rem' }}>Field</label>
                <input value={selectedNode.data.config?.field || ''} onChange={e => updateNodeConfig(selectedNode.id, { field: e.target.value })} placeholder="Field name" style={inputStyle} />
                <label style={{ color: '#888', fontSize: '0.78rem' }}>Value</label>
                <input value={selectedNode.data.config?.value || ''} onChange={e => updateNodeConfig(selectedNode.id, { value: e.target.value })} placeholder="New value" style={inputStyle} />
              </div>
            )}

            {/* SWITCH WORKFLOW CONFIG */}
            {selectedNode.data.nodeType === 'switch_workflow' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ color: '#888', fontSize: '0.78rem' }}>Target Workflow</label>
                <select value={selectedNode.data.config?.targetId || ''} onChange={e => { const wf = workflows.find((w: any) => w.id === e.target.value); updateNodeConfig(selectedNode.id, { targetId: e.target.value, targetName: wf?.name || '' }) }} style={selectStyle}>
                  <option value="">Select workflow...</option>
                  {workflows.filter((w: any) => w.id !== workflow?.id).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            )}

            {/* DELETE NODE */}
            {selectedNode.type !== 'trigger' && (
              <button onClick={() => deleteNode(selectedNode.id)} style={{ marginTop: 20, width: '100%', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, padding: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Delete Node</button>
            )}
          </div>
        )}
      </div>

      {/* TEMPLATE LIBRARY MODAL */}
      {templatesOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setTemplatesOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#16213E', borderRadius: 12, border: '1px solid #2a2a4a', maxWidth: 600, width: '90%', maxHeight: '80vh', overflow: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#D4A843', fontWeight: 700, margin: 0 }}>{t.wfTemplateLibrary || 'Template Library'}</h3>
              <button onClick={() => setTemplatesOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            {templates.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', padding: '24px 0' }}>
                <p>No templates available.</p>
                <p style={{ fontSize: '0.78rem' }}>Run the seed-templates API first: <code style={{ color: '#D4A843' }}>/api/seed-templates</code></p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {templates.map((tpl: any) => {
                const steps = (tpl.workflow_steps || []).sort((a: any, b: any) => a.step_order - b.step_order)
                const triggerInfo = TRIGGER_TYPES.find(tt => tt.id === tpl.trigger_type)
                return (
                  <div key={tpl.id} style={{ background: '#1A1A2E', borderRadius: 8, border: '1px solid #2a2a4a', padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#E0E0E0', marginBottom: 4 }}>{tpl.name}</div>
                        {tpl.description && <div style={{ color: '#888', fontSize: '0.78rem', marginBottom: 6 }}>{tpl.description}</div>}
                        <div style={{ display: 'flex', gap: 8, fontSize: '0.72rem' }}>
                          <span style={{ color: '#D4A843' }}>{triggerInfo?.icon} {triggerInfo?.label}</span>
                          <span style={{ color: '#666' }}>•</span>
                          <span style={{ color: '#888' }}>{steps.length} steps</span>
                        </div>
                      </div>
                      <button onClick={() => useTemplate(tpl)} style={{ background: '#D4A843', color: '#1A1A2E', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.wfUseTemplate || 'Use Template'}</button>
                    </div>
                    {/* Mini step preview */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                      {steps.slice(0, 8).map((s: any, i: number) => {
                        const info = [...ACTION_TYPES, ...CONDITION_TYPES, ...FLOW_CONTROL_TYPES].find(t => t.id === s.step_type)
                        return (
                          <span key={i} style={{ background: '#16213E', border: '1px solid #2a2a4a', borderRadius: 4, padding: '2px 6px', fontSize: '0.65rem', color: '#AAAAAA' }}>
                            {info?.icon || '⚡'} {info?.label || s.step_type}
                          </span>
                        )
                      })}
                      {steps.length > 8 && <span style={{ color: '#666', fontSize: '0.65rem', padding: '2px 4px' }}>+{steps.length - 8} more</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════════════ */
const inputStyle: React.CSSProperties = {
  background: '#1a1a2e',
  border: '1px solid #2a2a4a',
  borderRadius: 6,
  padding: '8px 10px',
  color: '#E0E0E0',
  fontSize: '0.82rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
}

/* ═══════════════════════════════════════════════════════════════════════
   EXPORTED WRAPPER (provides ReactFlowProvider)
   ═══════════════════════════════════════════════════════════════════════ */
export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
