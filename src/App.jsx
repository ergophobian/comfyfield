import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import TopBar from './components/nav/TopBar.jsx'
import { RecipeSheet } from './components/Recipes.jsx'
import Explore from './pages/Explore.jsx'
import ImageStudio from './pages/ImageStudio.jsx'
import VideoStudio from './pages/VideoStudio.jsx'
import AudioStudio from './pages/AudioStudio.jsx'
import Apps from './pages/Apps.jsx'
import AppPage from './pages/AppPage.jsx'
import Effects from './pages/Effects.jsx'
import Motion from './pages/Motion.jsx'
import MixedMedia from './pages/MixedMedia.jsx'
import CinemaStudio from './pages/CinemaStudio.jsx'
import Influencer from './pages/Influencer.jsx'
import Character from './pages/Character.jsx'
import Moodboard from './pages/Moodboard.jsx'
import Photodump from './pages/Photodump.jsx'
import FashionFactory from './pages/FashionFactory.jsx'
import MarketingStudio from './pages/MarketingStudio.jsx'
import AdsStudio from './pages/AdsStudio.jsx'
import FacelessStudio from './pages/FacelessStudio.jsx'
import Explainer from './pages/Explainer.jsx'
import ShortsStudio from './pages/ShortsStudio.jsx'
import ThreeD from './pages/ThreeD.jsx'
import LipsyncStudio from './pages/LipsyncStudio.jsx'
import EditImage from './pages/EditImage.jsx'
import Upscale from './pages/Upscale.jsx'
import EditVideo from './pages/EditVideo.jsx'
import Reframe from './pages/Reframe.jsx'
import Assistant from './pages/Assistant.jsx'
import Skills from './pages/Skills.jsx'
import SkillPage from './pages/SkillPage.jsx'
import Library from './pages/Library.jsx'
import Connections from './pages/Connections.jsx'
import Pods from './pages/Pods.jsx'
import Flows from './pages/Flows.jsx'
import Models from './pages/Models.jsx'
import Workspaces from './pages/Workspaces.jsx'
import { AppCtx } from './lib/appContext.js'
import { formatById, isWired } from './lib/formats/index.js'
import { getConnections } from './lib/providers.js'
import { useGenerations } from './lib/useGenerations.js'
import { usePodPolling } from './lib/usePod.js'
import PodSheet from './components/pod/PodSheet.jsx'
import RunToasts from './components/RunToasts.jsx'
import { usePicker } from './lib/usePicker.js'

export default function App() {
  // Lifted here so a render keeps going when you switch pages.
  const gens = useGenerations()
  const { pathname, search } = useLocation()
  const [connections, setConnections] = useState({})
  const picker = usePicker(connections)
  const [sheet, setSheet] = useState(null)
  useEffect(() => { getConnections().then(setConnections) }, [])
  usePodPolling()

  // One format sheet for the whole app, so any page, card or "Use in" menu can open a format.
  const ctx = useMemo(() => ({
    gens, picker, connections,
    refreshConnections: () => getConnections().then(setConnections),
    openFormat: (f, initial) => {
      const format = typeof f === 'string' ? formatById(f) : f
      if (format && isWired(format)) setSheet({ format, initial })
    },
  }), [gens, picker, connections])

  return (
    <AppCtx.Provider value={ctx}>
      <div className="sky" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <TopBar />
      {Object.keys(connections).length > 0 && !Object.values(connections).some((c) => c.connected) && pathname !== '/connections' && (
        <p className="notice" role="status">No keys yet. <Link to="/connections">Open Connections</Link> to add a provider key when you are ready to generate.</p>
      )}
      <div className="route" key={pathname}>
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/image" element={<ImageStudio />} />
          <Route path="/video" element={<VideoStudio />} />
          <Route path="/video/edit" element={<EditVideo />} />
          <Route path="/audio" element={<AudioStudio />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/apps/:id" element={<AppPage />} />
          <Route path="/effects" element={<Effects />} />
          <Route path="/motion" element={<Motion />} />
          <Route path="/motion/:id" element={<AppPage />} />
          <Route path="/mixed-media" element={<MixedMedia />} />
          <Route path="/cinema" element={<CinemaStudio />} />
          <Route path="/influencer" element={<Influencer />} />
          <Route path="/character" element={<Character />} />
          <Route path="/moodboard" element={<Moodboard />} />
          <Route path="/photodump" element={<Photodump />} />
          <Route path="/fashion" element={<FashionFactory />} />
          <Route path="/marketing" element={<MarketingStudio />} />
          <Route path="/ads" element={<AdsStudio />} />
          <Route path="/faceless" element={<FacelessStudio />} />
          <Route path="/explainer" element={<Explainer />} />
          <Route path="/shorts" element={<ShortsStudio />} />
          <Route path="/3d" element={<ThreeD />} />
          <Route path="/lipsync" element={<LipsyncStudio />} />
          <Route path="/edit" element={<EditImage />} />
          <Route path="/upscale" element={<Upscale />} />
          <Route path="/reframe" element={<Reframe />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skills/:id" element={<SkillPage />} />
          <Route path="/assets" element={<Library gens={gens} />} />
          <Route path="/library" element={<Navigate to={`/assets${search}`} replace />} />
          <Route path="/flows" element={<Flows picker={picker} />} />
          <Route path="/canvas" element={<Navigate to="/flows" replace />} />
          <Route path="/models" element={<Models picker={picker} />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/pods" element={<Pods />} />
          <Route path="/workspaces" element={<Workspaces />} />
        </Routes>
      </div>
      <PodSheet />
      <RunToasts />
      {sheet && <RecipeSheet key={sheet.format.id} recipe={sheet.format} initial={sheet.initial} gens={gens} connections={connections} onClose={() => setSheet(null)} />}
    </AppCtx.Provider>
  )
}
