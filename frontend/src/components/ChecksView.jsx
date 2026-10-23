import { useState } from 'react'
import DueStatusCard from './DueStatusCard'
import BodyMeasurementSection from './BodyMeasurementSection'
import FitnessTestSection from './FitnessTestSection'
import LabResultSection from './LabResultSection'
import HairPhotoSection from './HairPhotoSection'

export default function ChecksView() {
  const [refreshKey, setRefreshKey] = useState(0)
  const onChanged = () => setRefreshKey((k) => k + 1)

  return (
    <>
      <DueStatusCard key={refreshKey} />
      <BodyMeasurementSection onChanged={onChanged} />
      <FitnessTestSection onChanged={onChanged} />
      <LabResultSection onChanged={onChanged} />
      <HairPhotoSection onChanged={onChanged} />
    </>
  )
}
