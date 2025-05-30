"""
=============================================================================
ANALYTICS ROUTER - DASHBOARD QUE MOSTRA ONDE TÁ O DINHEIRO
Métricas enterprise que outros cobram R$5.000/mês para ter
=============================================================================
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_dashboard_metrics(
    period: str = Query("30d", description="7d, 30d, 90d, 1y"),
    agent_id: Optional[UUID] = Query(None, description="Filtrar por agente"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dashboard principal - métricas que importam para CEO"""
    service = AnalyticsService(db)
    metrics = await service.get_dashboard_metrics(
        current_user.id, period, agent_id
    )
    return {
        "conversion_rate": metrics.conversion_rate,
        "total_conversations": metrics.total_conversations,
        "total_conversions": metrics.total_conversions,
        "avg_response_time": metrics.avg_response_time,
        "revenue_generated": metrics.revenue_generated,
        "growth_percentage": metrics.growth_percentage,
        "top_performing_agents": metrics.top_agents,
        "conversion_funnel": metrics.funnel_data
    }

@router.get("/revenue")
async def get_revenue_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    granularity: str = Query("day", description="hour, day, week, month"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analytics de receita - o que CEO quer ver"""
    service = AnalyticsService(db)
    revenue = await service.get_revenue_analytics(
        current_user.id, start_date, end_date, granularity
    )
    return revenue

@router.get("/conversion-funnel")
async def get_conversion_funnel(
    period: str = Query("30d"),
    agent_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Funil de conversão - onde você perde clientes"""
    service = AnalyticsService(db)
    funnel = await service.get_conversion_funnel(
        current_user.id, period, agent_id
    )
    return {
        "total_visitors": funnel.visitors,
        "started_conversation": funnel.conversations,
        "engaged_users": funnel.engaged,
        "qualified_leads": funnel.qualified,
        "conversions": funnel.conversions,
        "conversion_rate": funnel.conversion_rate,
        "drop_off_points": funnel.drop_offs
    }

@router.get("/agents/performance")
async def get_agents_performance(
    period: str = Query("30d"),
    sort_by: str = Query("conversion_rate", description="conversion_rate, total_conversations, revenue"),
    limit: int = Query(10),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Performance dos agentes - ranking dos que mais convertem"""
    service = AnalyticsService(db)
    performance = await service.get_agents_performance(
        current_user.id, period, sort_by, limit
    )
    return performance

@router.get("/conversations/patterns")
async def get_conversation_patterns(
    period: str = Query("30d"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Padrões de conversa - insights para otimizar"""
    service = AnalyticsService(db)
    patterns = await service.analyze_conversation_patterns(
        current_user.id, period
    )
    return {
        "avg_messages_to_convert": patterns.avg_messages,
        "best_converting_times": patterns.peak_hours,
        "common_objections": patterns.objections,
        "successful_responses": patterns.winning_responses,
        "conversation_flow": patterns.flow_analysis
    }

@router.get("/real-time")
async def get_realtime_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Métricas em tempo real - para dashboard ao vivo"""
    service = AnalyticsService(db)
    realtime = await service.get_realtime_metrics(current_user.id)
    return {
        "active_conversations": realtime.active_conversations,
        "conversations_today": realtime.conversations_today,
        "conversions_today": realtime.conversions_today,
        "revenue_today": realtime.revenue_today,
        "response_time_avg": realtime.avg_response_time,
        "online_agents": realtime.online_agents
    }

@router.get("/cohort-analysis")
async def get_cohort_analysis(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Análise de coorte - retention enterprise"""
    service = AnalyticsService(db)
    cohort = await service.get_cohort_analysis(
        current_user.id, start_date, end_date
    )
    return cohort

@router.get("/export")
async def export_analytics(
    format: str = Query("csv", description="csv, xlsx, json"),
    period: str = Query("30d"),
    include_conversations: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export de dados - para análise externa"""
    service = AnalyticsService(db)
    export_data = await service.export_analytics(
        current_user.id, format, period, include_conversations
    )
    return export_data

@router.get("/predictions")
async def get_predictions(
    forecast_days: int = Query(30, description="Dias para prever"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Previsões IA - machine learning que funciona"""
    service = AnalyticsService(db)
    predictions = await service.get_ml_predictions(
        current_user.id, forecast_days
    )
    return {
        "revenue_forecast": predictions.revenue_forecast,
        "conversion_trend": predictions.conversion_trend,
        "optimal_agent_count": predictions.optimal_agents,
        "peak_hours_prediction": predictions.peak_hours,
        "churn_risk_score": predictions.churn_risk
    }