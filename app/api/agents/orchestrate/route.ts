import { NextRequest, NextResponse } from 'next/server';
import AgentOrchestrator from '../../../../lib/agent-orchestrator';

export async function POST(request: NextRequest) {
  try {
    const { action, phase } = await request.json();
    
    const orchestrator = new AgentOrchestrator();
    
    if (action === 'execute_accelerated_deployment') {
      console.log('🚀 Initiating Accelerated Deployment via API');
      
      // Execute the accelerated deployment
      await orchestrator.executeAcceleratedDeployment();
      
      return NextResponse.json({
        success: true,
        message: 'Accelerated deployment completed successfully',
        agents: orchestrator.getAllAgents(),
        executionHistory: orchestrator.getExecutionHistory()
      });
      
    } else if (action === 'execute_phase' && phase) {
      console.log(`🎯 Executing Phase: ${phase}`);
      
      const results = await orchestrator.executePhase(phase);
      
      return NextResponse.json({
        success: true,
        message: `Phase ${phase} completed`,
        results,
        agents: orchestrator.getAllAgents()
      });
      
    } else if (action === 'get_status') {
      return NextResponse.json({
        success: true,
        agents: orchestrator.getAllAgents(),
        executionHistory: orchestrator.getExecutionHistory()
      });
      
    } else {
      return NextResponse.json({
        error: 'Invalid action. Use "execute_accelerated_deployment", "execute_phase", or "get_status"'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Agent orchestration error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const orchestrator = new AgentOrchestrator();
    
    return NextResponse.json({
      success: true,
      agents: orchestrator.getAllAgents(),
      executionHistory: orchestrator.getExecutionHistory(),
      availablePhases: ['phase_1_d3', 'phase_2_g1'],
      status: 'Agent orchestrator ready'
    });
    
  } catch (error) {
    console.error('Agent orchestrator status error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}