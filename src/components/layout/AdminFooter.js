import React from 'react';

import {
  FiHeart,
  FiShield,
} from 'react-icons/fi';

import { useLanguage } from '../../contexts/LanguageContext';


// =====================================================
// ADMIN FOOTER
// =====================================================

const AdminFooter = () => {

  const currentYear =
    new Date().getFullYear();

  const {
    language,
    t,
  } = useLanguage();


  return (

    <footer
      className={`
        bg-white/80

        border-t
        border-slate-200

        px-4
        sm:px-6

        py-4

        ${
          language === 'km'
            ? 'font-khmer'
            : 'font-english'
        }
      `}
    >

      <div
        className="
          flex
          flex-col
          sm:flex-row

          sm:items-center
          sm:justify-between

          gap-3

          text-sm
        "
      >


        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <div
          className="
            flex
            flex-wrap
            items-center

            gap-1.5

            text-blue-400
          "
        >

          <span>
            © {currentYear}
          </span>


          <span
            className="
              font-semibold
              text-blue-900
            "
          >
            SC Academy
          </span>


          <span>
            {t('footer.allRightsReserved')}
          </span>

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================== */}

        <div
          className="
            flex
            flex-wrap
            items-center

            gap-3
            sm:gap-4
          "
        >


          {/* =================================================
              ADMIN PANEL
          ================================================== */}

          <div
            className="
              flex
              items-center

              gap-1.5

              text-blue-400
            "
          >

            <FiShield
              size={14}
              className="
                text-red-600
                flex-shrink-0
              "
            />


            <span>
              {t('footer.adminPanel')}
            </span>

          </div>


          {/* =================================================
              DIVIDER
          ================================================== */}

          <span
            className="
              hidden
              sm:block

              w-px
              h-4

              bg-blue-200
            "
          />


          {/* =================================================
              VERSION
          ================================================== */}

          <span
            className="
              inline-flex
              items-center

              px-2.5
              py-1

              rounded-lg

              bg-blue-50
              text-blue-900

              border
              border-blue-200

              text-xs
              font-semibold
            "
          >

            v1.0.0

          </span>


          {/* =================================================
              BUILT WITH LOVE
          ================================================== */}

          <div
            className="
              hidden
              md:flex

              items-center
              gap-1

              text-xs
              text-blue-300
            "
          >

            <span>
              {t('footer.builtWith')}
            </span>


            <FiHeart
              size={12}
              className="
                text-red-600
                fill-current
                flex-shrink-0
              "
            />


            <span>
              {t('footer.forScAcademy')}
            </span>

          </div>

        </div>

      </div>

    </footer>

  );

};


export default AdminFooter;
