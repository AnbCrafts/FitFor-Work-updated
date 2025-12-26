import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { WorkContext } from "../../ContextAPI/WorkContext";
import { ArrowLeftCircle } from "lucide-react";

const SeekerDetailsCard = () => {
  const { id, hash } = useParams();
  const { getCompanyByOwnerId, authData, getMatchedData, matchedData } =
    useContext(WorkContext);

  const navigate = useNavigate();

  // Load employer data
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) getCompanyByOwnerId(uid);
  }, [hash]);

  const [authId, setAuthId] = useState(null);

  useEffect(() => {
    if (authData && authData._id) setAuthId(authData._id);
  }, [authData]);

  useEffect(() => {
    if (authId) getMatchedData(authId);
  }, [authId]);

  const data = matchedData?.seekers?.[id];

  if (!data)
    return (
      <div className="text-center text-gray-400 py-20 text-xl tracking-wide">
        ❌ No seeker details found.
      </div>
    );

  return (
    <div className="w-[90%] md:w-[75%] mx-auto mt-10 mb-20">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <ArrowLeftCircle
          className="h-10 w-10 text-indigo-500 hover:text-pink-500 transition cursor-pointer"
          onClick={() => navigate(`/auth/authority/${hash}/profile`)}
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-500 text-transparent bg-clip-text tracking-wide">
          Applicant Details
        </h1>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white shadow-xl rounded-2xl p-10 border border-purple-100">

        {/* PROFILE SECTION */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-10">
          <img
            src={data.picture}
            alt="Profile"
            className="h-28 w-28 rounded-full object-cover border-4 border-purple-300 shadow-lg"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
            <p className="text-gray-500">{data.email}</p>
            <p className="text-gray-500">{data.phone}</p>
          </div>
        </div>

        {/* GRID DETAILS */}
        <div className="grid md:grid-cols-2 gap-6 text-gray-700">

          <Detail label="Address" value={data.address} />
          <Detail label="Desired Post" value={data.desiredPost} />
          <Detail label="Status" value={data.status} />
          <Detail label="Experience" value={`${data.experience} years`} />
          <Detail label="Qualifications" value={data.qualifications} />
          <Detail label="Preferred Location" value={data.preferredLocation} />
          <Detail label="Preferred Job Type" value={data.preferredJobType} />
          <Detail label="Available From" value={data.availableFrom} />
          <Detail label="Current Company" value={data.currentCompany} />
          <Detail label="Current Post" value={data.currentPost} />
          <Detail label="Current CTC" value={data.currentCTC} />
          <Detail label="Expected CTC" value={data.expectedCTC} />

          {data.portfolioLink && (
            <Detail
              label="Portfolio"
              value={
                <a
                  href={data.portfolioLink}
                  target="_blank"
                  className="text-indigo-500 underline hover:text-pink-500"
                >
                  View Portfolio
                </a>
              }
            />
          )}

          {data.resume && (
            <Detail
              label="Resume"
              value={
                <a
                  href={data.resume}
                  target="_blank"
                  className="text-indigo-500 underline hover:text-pink-500"
                >
                  Download Resume
                </a>
              }
            />
          )}
        </div>

        {/* SKILLS */}
        {data.skills?.length > 0 && (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* CERTIFICATIONS */}
        {data.certifications?.length > 0 && (
          <Section title="Certifications">
            <ul className="list-disc ml-6 text-gray-700">
              {data.certifications.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* LANGUAGES */}
        {data.languagesKnown?.length > 0 && (
          <Section title="Languages Known">
            <ul className="list-disc ml-6 text-gray-700">
              {data.languagesKnown.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* ACHIEVEMENTS */}
        {data.achievements?.length > 0 && (
          <Section title="Achievements">
            <ul className="list-disc ml-6 text-gray-700">
              {data.achievements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
};

/* Small Components */
const Detail = ({ label, value }) => (
  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 shadow-sm">
    <p className="text-sm text-purple-600 font-semibold">{label}</p>
    <p className="text-gray-900 mt-1">{value}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mt-10">
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    {children}
  </div>
);

export default SeekerDetailsCard;
