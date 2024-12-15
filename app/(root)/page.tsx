import { convertFileSize, getUsageSummary } from "@/lib/utils";
import { getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { getFiles } from "@/lib/actions/file.actions";

import Link from "next/link";
import Image from "next/image";
import { exportTraceState } from "next/dist/trace";

import { Chart } from "@/components/Chart";
import { Separator } from "@/components/ui/separator";
import { FormattedDateTime } from "@/components/FormattedDateTime";
import { Thumbnail } from "@/components/Thumbnail";
import { ActionDropDown } from "@/components/ActionDropDown";

import { Models } from "appwrite";
const Dashboard = async () => {
  // Parallel requests
  const [files, totalSpace] = await Promise.all([
    getFiles({types: [], limit: 10}),
    getTotalSpaceUsed()
  ]);

  // Get the usage summary
  const usageSummary = getUsageSummary(totalSpace)
  
  return (
    <div className="dashboard-container"> 
    <section>
      <Chart used={totalSpace.used} />

      {/* Uploaded file type summaries */}
      <ul className="dashboard-summary-list">
        {usageSummary.map((summary) => (
          <Link
            href={summary.url}
            key={summary.title}
            className="dashboard-summary-card"
          >
            <div className="space-y-4">
              <div className="flex justify-between gap-3">
                <Image 
                  src={summary.icon}
                  width={100}
                  height={100}
                  alt="uploaded image"
                  className="summary-type-icon"
                />
                <h4 className="summary-type-size">
                  {convertFileSize(summary.size) || 0}
                </h4>
              </div>

              <h5 className="summary-type-title">{summary.title}</h5>
              <Separator className="bg-light-400"/>
              <FormattedDateTime 
                date={summary.latestDate}
                className="text-center"
              />
            </div>
          </Link>
        ))}
      </ul>
    </section>
    {/* Recent files uploaded */}
    <section>
      <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>
      {files.documents.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-5">
          {files.documents.map((file: Models.Document) => (
            <Link
              href={file.url}
              target="_blank"
              className="flex items-center gap-3"
              key={file.$id}
            >
              <Thumbnail
                type={file.type}
                extension={file.extension}
                url={file.url} 
              />

              <div className="recent-file-details">
                <div className="fle flex-col gap-1">
                  <p className="recent-file-name">{file.name}</p>
                  <FormattedDateTime 
                    date={file.$createdAt}
                    className="caption"
                  />
                </div>
                <ActionDropDown file={file} />
              </div>
            </Link>
          ))}
        </ul>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </section>
    </div>
  )
};

export default Dashboard;