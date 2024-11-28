import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { plans } from '../lib/api';
import type { StudyPlan } from '../lib/types';
import { toast } from 'react-hot-toast';

export function Dashboard() {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await plans.getAll();
      // Ensure we're working with an array of study plans
      const plansData = Array.isArray(response.data) ? response.data : [];
      setStudyPlans(plansData);
    } catch (error) {
      toast.error('Failed to load study plans');
      setStudyPlans([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-600">Loading study plans...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Study Plans</h1>
        <Link
          to="/plans/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {studyPlans.length > 0 ? (
          studyPlans.map((plan) => (
            <Link
              key={plan.id}
              to={`/plans/${plan.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{plan.title}</h2>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-2 text-gray-600 line-clamp-2">{plan.description}</p>
                <div className="mt-4">
                  <div className="text-sm text-gray-500">
                    {new Date(plan.startDate).toLocaleDateString()} -{' '}
                    {new Date(plan.endDate).toLocaleDateString()}
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {plan.tasks?.filter((task) => task.status === 'completed').length || 0} /{' '}
                      {plan.tasks?.length || 0} tasks completed
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">No study plans yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating a new study plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}