import React, { useContext, useEffect, useState } from "react";
import { WorkContext } from "../../ContextAPI/WorkContext";
import OverView from "../Components/CompanyOverView";
import PageNav from "../../Global/Components/PageNav";
import { useParams } from "react-router-dom";

const Authorities = () => {
  const {
    getWantedAuthorities,
    wantedAuth,
    getSeekerDataByUserId,
    user_seekerData,
  } = useContext(WorkContext);

  const { hash } = useParams();

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch seeker data
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) getSeekerDataByUserId(userId);
  }, [hash]);

  // Fetch authorities for this seeker
  useEffect(() => {
    if (user_seekerData?._id) {
      setLoading(true);
      getWantedAuthorities(user_seekerData._id, page, limit).finally(() =>
        setLoading(false)
      );
    }
  }, [user_seekerData?._id, page, limit]);

  const authorities = wantedAuth?.authorities || [];
  const totalCount = wantedAuth?.totalAuthorities || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="w-[90%] mx-auto px-4">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Recommended Employers
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Based on your skills, we’ve matched you with employers currently
            searching for talent like you. Explore their company overviews to
            find teams that align with your goals.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-500">
            Loading recommended employers...
          </div>
        )}

        {/* Empty State */}
        {!loading && authorities.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Matches Found
            </h2>
            <p className="text-gray-500">
              Once you complete your profile or apply for more jobs, employers
              will appear here.
            </p>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && authorities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authorities.map((item) => (
              <OverView key={item._id} company={item} id={item._id} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <PageNav
              currentPage={page}
              totalPages={totalPages}
              incrementer={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Authorities;
