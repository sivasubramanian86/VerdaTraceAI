from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.services.database import Base


class Project(Base):
    """SQLAlchemy model for AI Projects."""

    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    workspace_id = Column(String, index=True)
    name = Column(String)
    provider = Column(String)
    model_family = Column(String)
    region = Column(String)
    hardware_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class EmissionResult(Base):
    """SQLAlchemy model for calculated emissions."""

    __tablename__ = "emission_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String, ForeignKey("projects.id"))
    snapshot_timestamp = Column(DateTime(timezone=True))
    kwh_consumed = Column(Float)
    co2e_emitted = Column(Float)
    green_score = Column(Integer)


class CarbonCreditsLedger(Base):
    """SQLAlchemy model for carbon credits transaction ledger."""

    __tablename__ = "carbon_credits_ledger"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, index=True)
    source = Column(String)  # e.g., "AI Workloads", "DigitalLoop", "LocalLoop"
    description = Column(String)
    credits_earned = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class DigitalMission(Base):
    """SQLAlchemy model for digital clean-up missions."""

    __tablename__ = "digital_missions"

    id = Column(String, primary_key=True)
    title = Column(String)
    description = Column(String)
    carbon_savings_g = Column(Float)
    credits_reward = Column(Integer)
    status = Column(String)  # "available", "completed"


class Scope3Transaction(Base):
    """SQLAlchemy model for local commerce transaction logging."""

    __tablename__ = "scope3_transactions"

    id = Column(String, primary_key=True)
    store_name = Column(String)
    location = Column(String)
    is_local = Column(Integer)  # 1 for local, 0 otherwise
    amount_spent = Column(Float)
    logistics_savings_kg = Column(Float)
    credits_earned = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class FoodMilesMetric(Base):
    """SQLAlchemy model for food items and their transportation miles."""

    __tablename__ = "food_miles_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_name = Column(String)
    origin = Column(String)
    distance_km = Column(Float)
    transport_co2e_kg = Column(Float)
    local_swap_name = Column(String)


class MobilityEvent(Base):
    """SQLAlchemy model for travel & transportation logs."""

    __tablename__ = "mobility_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mode = Column(String)  # "Metro", "EV Bus", "Walking", "Cycling", "Cab"
    distance_km = Column(Float)
    co2e_saved_kg = Column(Float)
    credits_earned = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class InfraFeedback(Base):
    """SQLAlchemy model for crowdsourced city infrastructure feedback."""

    __tablename__ = "infra_feedbacks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    issue_type = Column(String)  # "missing_ev_charger", "broken_bike_lane"
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class CircularItem(Base):
    """SQLAlchemy model for neighborhood sharing items."""

    __tablename__ = "circular_items"

    id = Column(String, primary_key=True)
    name = Column(String)
    owner = Column(String)
    status = Column(String)  # "available", "borrowed"
    embedded_co2e_saved_kg = Column(Float)
