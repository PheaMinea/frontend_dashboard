import React, {
  useEffect,
  useState,
} from 'react';

import {
  toast,
} from 'react-toastify';

import {
  FiMail,
  FiCheckCircle,
  FiTrash2,
  FiEye,
  FiUser,
  FiClock,
  FiPhone,
  FiInbox,
} from 'react-icons/fi';

import api, {
  getApiErrorMessage,
} from '../../services/api';

import AdminTable from '../common/AdminTable';
import AdminCard from '../common/AdminCard';
import AdminModal from '../common/AdminModal';

import {
  useLanguage,
} from '../../contexts/LanguageContext';

import {
  useNotification,
} from '../../contexts/NotificationContext';


const AdminMessages = () => {

  // =====================================================
  // LANGUAGE
  // =====================================================

  const {
    t,
    language,
  } = useLanguage();


  const {
    setUnreadCount,
  } = useNotification();


  const isKhmer =
    language === 'km' ||
    language === 'kh';


  // =====================================================
  // TRANSLATION FALLBACK
  // =====================================================

  const tr = (
    key,
    english,
    khmer
  ) => {

    const value =
      t(key);


    if (
      value &&
      value !== key
    ) {

      return value;

    }


    return isKhmer
      ? khmer
      : english;

  };


  // =====================================================
  // STATE
  // =====================================================

  const [
    messages,
    setMessages,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    selectedMessage,
    setSelectedMessage,
  ] = useState(null);


  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);


  // =====================================================
  // FETCH MESSAGES
  // =====================================================

  const fetchMessages = async () => {

    try {
      setLoading(true);
      const minDelay = new Promise((resolve) => setTimeout(resolve, 500));

      const [response] = await Promise.all([
        api.get('/api/contact/'),
        minDelay,
      ]);

      const data =
        response.data;


      if (
        Array.isArray(data)
      ) {

        setMessages(
          data
        );

      } else if (
        Array.isArray(
          data?.items
        )
      ) {

        setMessages(
          data.items
        );

      } else {

        setMessages([]);

      }


      const currentUnreadCount =
        Array.isArray(data)
          ? data.filter((message) => !message.is_read).length
          : Array.isArray(data?.items)
            ? data.items.filter((message) => !message.is_read).length
            : 0;


      setUnreadCount(currentUnreadCount);

    } catch (error) {

      console.error(
        'Fetch messages error:',
        error
      );


      toast.error(
        getApiErrorMessage(
          error,
          tr(
            'messages.loadFailed',
            'Failed to load messages.',
            'មិនអាចផ្ទុកសារបានទេ។'
          )
        )
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchMessages();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // =====================================================
  // MARK AS READ
  // =====================================================

  const handleMarkRead = async (
    id
  ) => {

    if (!id) {
      return;
    }


    try {

      setActionLoading(
        `read-${id}`
      );


      await api.put(
        `/api/contact/${id}/read`
      );


      toast.success(
        tr(
          'messages.markedReadSuccess',
          'Message marked as read.',
          'បានសម្គាល់សារថាបានអានដោយជោគជ័យ។'
        )
      );


      setMessages(
        (
          currentMessages
        ) =>
          currentMessages.map(
            (message) =>

              message.id === id
                ? {
                    ...message,
                    is_read: true,
                  }
                : message
          )
      );


      setUnreadCount(
        (
          prev
        ) => Math.max(
          0,
          prev - 1
        )
      );


      setSelectedMessage(
        (
          currentMessage
        ) => {

          if (
            !currentMessage ||
            currentMessage.id !== id
          ) {

            return currentMessage;

          }


          return {
            ...currentMessage,
            is_read: true,
          };

        }
      );

    } catch (error) {

      console.error(
        'Mark read error:',
        error
      );


      toast.error(
        getApiErrorMessage(
          error,
          tr(
            'messages.markReadFailed',
            'Failed to mark message as read.',
            'មិនអាចសម្គាល់សារថាបានអានបានទេ។'
          )
        )
      );

    } finally {

      setActionLoading(
        null
      );

    }

  };


  // =====================================================
  // DELETE MESSAGE
  // =====================================================

  const handleDelete = async (
    id
  ) => {

    if (!id) {
      return;
    }


    const confirmDelete =
      window.confirm(
        tr(
          'messages.deleteConfirm',
          'Are you sure you want to delete this message?',
          'តើអ្នកប្រាកដថាចង់លុបសារនេះមែនទេ?'
        )
      );


    if (!confirmDelete) {

      return;

    }


    try {

      setActionLoading(
        `delete-${id}`
      );


      await api.delete(
        `/api/contact/${id}`
      );


      toast.success(
        tr(
          'messages.deletedSuccess',
          'Message deleted successfully.',
          'បានលុបសារដោយជោគជ័យ។'
        )
      );


      setMessages(
        (
          currentMessages
        ) => {

          const filtered =
            currentMessages.filter(
              (message) =>
                message.id !== id
            );


          const wasUnread =
            selectedMessage &&
            selectedMessage.id === id &&
            !selectedMessage.is_read;


          if (wasUnread) {
            setUnreadCount(
              (
                prev
              ) => Math.max(
                0,
                prev - 1
              )
            );
          }


          return filtered;

        }
      );


      if (
        selectedMessage &&
        selectedMessage.id === id
      ) {

        setModalOpen(
          false
        );

        setSelectedMessage(
          null
        );

      }

    } catch (error) {

      console.error(
        'Delete message error:',
        error
      );


      toast.error(
        getApiErrorMessage(
          error,
          tr(
            'messages.deleteFailed',
            'Failed to delete message.',
            'មិនអាចលុបសារបានទេ។'
          )
        )
      );

    } finally {

      setActionLoading(
        null
      );

    }

  };


  // =====================================================
  // VIEW MESSAGE
  // =====================================================

  const handleView = (
    message
  ) => {

    if (!message) {
      return;
    }


    setSelectedMessage(
      message
    );


    setModalOpen(
      true
    );


    if (
      !message.is_read
    ) {

      handleMarkRead(
        message.id
      );

    }

  };


  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {

    setModalOpen(
      false
    );


    setSelectedMessage(
      null
    );

  };


  // =====================================================
  // COUNTS
  // =====================================================

  const unreadCount =
    messages.filter(
      (message) =>
        !message.is_read
    ).length;


  const readCount =
    messages.filter(
      (message) =>
        message.is_read
    ).length;


  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (
    value
  ) => {

    try {

      return Number(
        value || 0
      ).toLocaleString(
        isKhmer
          ? 'km-KH'
          : 'en-GB'
      );

    } catch {

      return value;

    }

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    value
  ) => {

    if (!value) {

      return '-';

    }


    let date;


    try {

      date = new Date(
        value
      );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return '-';

      }


      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = String(
        date.getHours()
      ).padStart(
        2,
        '0'
      );
      const minutes = String(
        date.getMinutes()
      ).padStart(
        2,
        '0'
      );


      if (isKhmer) {

        return `${year}-${month}-${day} ${hours}:${minutes}`;

      }


      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];


      return `${monthNames[date.getMonth()]} ${day}, ${year} ${hours}:${minutes}`;

    } catch {

      try {

        return String(
          value
        );

      } catch {

        return '-';

      }

    }

  };


  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = [

    // ===================================================
    // STATUS
    // ===================================================

    {
      key: 'is_read',

      label:
        tr(
          'messages.status',
          'Status',
          'ស្ថានភាព'
        ),

      render: (
        value
      ) => (

        <span
          className={`
            inline-flex
            items-center
            gap-1.5

            px-3
            py-1

            rounded-full

            text-xs
            font-semibold

            ${
              value
                ? `
                  bg-[#EBF9F0]
                  text-[#2E7D32]
                `
                : `
                  bg-[#FFEBEE]
                  text-[#C62828]
                `
            }
          `}
        >

          <span
            className={`
              w-1.5
              h-1.5

              rounded-full

              ${
                value
                  ? 'bg-[#2E7D32]'
                  : 'bg-[#C62828]'
              }
            `}
          />


          {
            value
              ? tr(
                  'messages.read',
                  'Read',
                  'បានអាន'
                )
              : tr(
                  'messages.unread',
                  'Unread',
                  'មិនទាន់អាន'
                )
          }

        </span>

      ),
    },


    // ===================================================
    // NAME
    // ===================================================

    {
      key: 'name',

      label:
        tr(
          'messages.name',
          'Name',
          'ឈ្មោះ'
        ),

      render: (
        value
      ) => (

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              w-9
              h-9

              flex
              items-center
              justify-center

              rounded-lg

              bg-[#F0F7FF]
              text-[#0D1B3E]

              flex-shrink-0
            "
          >

            <FiUser
              size={17}
            />

          </div>


          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                font-semibold
                text-[#0D1B3E]
                truncate
              "
            >

              {
                value ||
                '-'
              }

            </p>

          </div>

        </div>

      ),
    },


    // ===================================================
    // EMAIL
    // ===================================================

    {
      key: 'email',

      label:
        tr(
          'messages.email',
          'Email',
          'អ៊ីមែល'
        ),

      render: (
        value
      ) => (

        <div
          className="
            flex
            items-center
            gap-2

            text-sm
            text-[#0D1B3E]
          "
        >

          <FiMail
            size={15}

            className="
              text-[#6B8AFF]
              flex-shrink-0
            "
          />


          <span
            className="
              break-all
            "
          >

            {
              value ||
              '-'
            }

          </span>

        </div>

      ),
    },


    // ===================================================
    // SUBJECT
    // ===================================================

    {
      key: 'subject',

      label:
        tr(
          'messages.subject',
          'Subject',
          'ប្រធានបទ'
        ),

      render: (
        value
      ) => (

        <span
          className="
            inline-block

            max-w-[220px]

            truncate

            text-sm
            font-medium
            text-[#0D1B3E]
          "
        >

          {
            value ||
            tr(
              'messages.noSubject',
              'No subject',
              'គ្មានប្រធានបទ'
            )
          }

        </span>

      ),
    },


    // ===================================================
    // DATE
    // ===================================================

    {
      key: 'created_at',

      label:
        tr(
          'messages.date',
          'Date',
          'កាលបរិច្ឆេទ'
        ),

      render: (
        value
      ) => (

        <div
          className="
            flex
            items-center
            gap-2

            text-sm
            text-[#0D1B3E]

            whitespace-nowrap
          "
        >

          <FiClock
            size={14}

            className="
              text-[#6B8AFF]
            "
          />


          {
            formatDate(
              value
            )
          }

        </div>

      ),
    },


    // ===================================================
    // ACTIONS
    // ===================================================

    {
      key: 'actions',

      label:
        tr(
          'messages.actions',
          'Actions',
          'សកម្មភាព'
        ),

      render: (
        _,
        row
      ) => (

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          {/* VIEW */}

          <button
            type="button"

            onClick={() =>
              handleView(
                row
              )
            }

            title={
              tr(
                'messages.viewMessage',
                'View Message',
                'មើលសារ'
              )
            }

            className="
              w-8
              h-8

              flex
              items-center
              justify-center

              rounded-lg

              bg-[#F0F7FF]
              text-[#0D1B3E]

              hover:bg-[#0D1B3E]
              hover:text-white

              transition-all
              duration-200
            "
          >

            <FiEye
              size={15}
            />

          </button>


          {/* MARK READ */}

          {
            !row.is_read && (

              <button
                type="button"

                onClick={() =>
                  handleMarkRead(
                    row.id
                  )
                }

                disabled={
                  actionLoading ===
                  `read-${row.id}`
                }

                title={
                  tr(
                    'messages.markAsRead',
                    'Mark as Read',
                    'សម្គាល់ថាបានអាន'
                  )
                }

                className="
                  w-8
                  h-8

                  flex
                  items-center
                  justify-center

                  rounded-lg

                  bg-[#EBF9F0]
                  text-[#2E7D32]

                  hover:bg-[#2E7D32]
                  hover:text-white

                  disabled:opacity-50
                  disabled:cursor-not-allowed

                  transition-all
                  duration-200
                "
              >

                {
                  actionLoading ===
                  `read-${row.id}`
                    ? (

                        <span
                          className="
                            w-4
                            h-4

                            rounded-full

                            border-2
                            border-current/30
                            border-t-current

                            animate-spin
                          "
                        />

                      )
                    : (

                        <FiCheckCircle
                          size={15}
                        />

                      )
                }

              </button>

            )
          }


          {/* DELETE */}

          <button
            type="button"

            onClick={() =>
              handleDelete(
                row.id
              )
            }

            disabled={
              actionLoading ===
              `delete-${row.id}`
            }

            title={
              tr(
                'messages.deleteMessage',
                'Delete Message',
                'លុបសារ'
              )
            }

            className="
              w-8
              h-8

              flex
              items-center
              justify-center

              rounded-lg

              bg-[#FFEBEE]
              text-[#C62828]

              hover:bg-[#C62828]
              hover:text-white

              disabled:opacity-50
              disabled:cursor-not-allowed

              transition-all
              duration-200
            "
          >

            {
              actionLoading ===
              `delete-${row.id}`
                ? (

                    <span
                      className="
                        w-4
                        h-4

                        rounded-full

                        border-2
                        border-current/30
                        border-t-current

                        animate-spin
                      "
                    />

                  )
                : (

                    <FiTrash2
                      size={15}
                    />

                  )
            }

          </button>

        </div>

      ),
    },

  ];


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className={`
        w-full
        min-h-screen
        p-6
        bg-[#F0F7FF]

        ${
          isKhmer
            ? 'font-khmer'
            : 'font-english'
        }
      `}
    >


      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          flex-col

          lg:flex-row
          lg:items-center
          lg:justify-between

          gap-4

          mb-8
        "
      >

        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              w-12
              h-12

              flex
              items-center
              justify-center

              rounded-xl

              bg-[#0D1B3E]
              text-white

              shadow-md

              flex-shrink-0
            "
          >

            <FiMail
              size={22}
            />

          </div>


          <div>

            <h1
              className="
                text-2xl
                md:text-3xl

                font-bold

                text-[#0D1B3E]

                leading-tight
              "
            >

              {tr(
                'messages.title',
                'Messages',
                'សារ'
              )}

            </h1>


            <p
              className="
                text-sm
                text-[#6B8AFF]

                mt-0.5
              "
            >

              {tr(
                'messages.subtitle',
                'Manage contact messages',
                'គ្រប់គ្រងសារទំនាក់ទំនង'
              )}

            </p>

          </div>

        </div>


        {/* ===============================================
            COUNTERS
        =============================================== */}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >

          {/* UNREAD */}

          <div
            className="
              inline-flex
              items-center
              gap-2

              h-11

              px-4

              rounded-xl

              bg-[#FFEBEE]
              text-[#C62828]

              border
              border-[#FFCDD2]

              text-sm
              font-semibold
            "
          >

            <span
              className="
                w-2
                h-2

                rounded-full

                bg-[#C62828]
              "
            />


            {
              formatNumber(
                unreadCount
              )
            }{' '}


            {tr(
              'messages.unread',
              'Unread',
              'មិនទាន់អាន'
            )}

          </div>


          {/* READ */}

          <div
            className="
              inline-flex
              items-center
              gap-2

              h-11

              px-4

              rounded-xl

              bg-[#EBF9F0]
              text-[#2E7D32]

              border
              border-[#C8E6C9]

              text-sm
              font-semibold
            "
          >

            <FiCheckCircle
              size={17}
            />


            {
              formatNumber(
                readCount
              )
            }{' '}


            {tr(
              'messages.read',
              'Read',
              'បានអាន'
            )}

          </div>


          {/* TOTAL */}

          <div
            className="
              inline-flex
              items-center
              gap-2

              h-11

              px-4

              rounded-xl

              bg-[#F0F7FF]
              text-[#0D1B3E]

              border
              border-[#E8EEF9]

              text-sm
              font-semibold
            "
          >

            <FiInbox
              size={17}
            />


            {
              formatNumber(
                messages.length
              )
            }{' '}


            {tr(
              'messages.total',
              'Total',
              'សរុប'
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================== */}

      <AdminCard
        className="
          overflow-hidden

          bg-white

          border
          border-[#F0F4FB]

          rounded-xl

          shadow-sm
        "
      >

        <AdminTable
          columns={
            columns
          }

          data={
            messages
          }

          loading={
            loading
          }
        />

      </AdminCard>


      {/* =================================================
          MESSAGE DETAILS MODAL
      ================================================== */}

      <AdminModal
        isOpen={
          modalOpen
        }

        onClose={
          closeModal
        }

        title={
          tr(
            'messages.details',
            'Message Details',
            'ព័ត៌មានលម្អិតនៃសារ'
          )
        }
      >

        <div
          className={
            isKhmer
              ? 'font-khmer'
              : 'font-english'
          }
        >

          {
            selectedMessage && (

              <div>


                {/* =======================================
                    USER HEADER
                ======================================= */}

                <div
                  className="
                    flex
                    items-center
                    gap-4

                    p-4

                    mb-5

                    rounded-xl

                    bg-[#F0F7FF]

                    border
                    border-[#E8EEF9]
                  "
                >

                  <div
                    className="
                      w-12
                      h-12

                      flex
                      items-center
                      justify-center

                      rounded-xl

                      bg-[#0D1B3E]
                      text-white

                      flex-shrink-0
                    "
                  >

                    <FiUser
                      size={21}
                    />

                  </div>


                  <div
                    className="
                      min-w-0
                    "
                  >

                    <h3
                      className="
                        text-base
                        font-bold
                        text-[#0D1B3E]
                        truncate
                      "
                    >

                      {
                        selectedMessage.name ||
                        '-'
                      }

                    </h3>


                    <p
                      className="
                        text-sm
                        text-[#6B8AFF]
                        truncate
                      "
                    >

                      {
                        selectedMessage.email ||
                        '-'
                      }

                    </p>

                  </div>


                  <div
                    className="
                      ml-auto
                    "
                  >

                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-1.5

                        px-3
                        py-1

                        rounded-full

                        text-xs
                        font-semibold

                        ${
                          selectedMessage.is_read
                            ? `
                              bg-[#EBF9F0]
                              text-[#2E7D32]
                            `
                            : `
                              bg-[#FFEBEE]
                              text-[#C62828]
                            `
                        }
                      `}
                    >

                      {
                        selectedMessage.is_read
                          ? (

                              <FiCheckCircle size={14} />

                            )
                          : (

                              <FiMail size={14} />

                            )
                      }


                      {
                        selectedMessage.is_read
                          ? tr(
                              'messages.read',
                              'Read',
                              'បានអាន'
                            )
                          : tr(
                              'messages.unread',
                              'Unread',
                              'មិនទាន់អាន'
                            )
                      }

                    </span>

                  </div>

                </div>


                {/* =======================================
                    EMAIL + PHONE
                ======================================= */}

                <div
                  className="
                    grid
                    grid-cols-1

                    md:grid-cols-2

                    gap-4
                  "
                >

                  {/* EMAIL */}

                  <div
                    className="
                      p-4

                      rounded-xl

                      border
                      border-[#E8EEF9]

                      bg-[#F0F7FF]
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide

                        text-[#6B8AFF]

                        mb-1.5
                      "
                    >

                      {tr(
                        'messages.email',
                        'Email',
                        'អ៊ីមែល'
                      )}

                    </p>


                    <div
                      className="
                        flex
                        items-center
                        gap-2

                        text-sm
                        font-medium
                        text-[#0D1B3E]
                      "
                    >

                      <FiMail
                        className="
                          text-[#0D1B3E]
                          flex-shrink-0
                        "
                      />


                      <span
                        className="
                          break-all
                        "
                      >

                        {
                          selectedMessage.email ||
                          '-'
                        }

                      </span>

                    </div>

                  </div>


                  {/* PHONE */}

                  <div
                    className="
                      p-4

                      rounded-xl

                      border
                      border-[#E8EEF9]

                      bg-[#F0F7FF]
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide

                        text-[#6B8AFF]

                        mb-1.5
                      "
                    >

                      {tr(
                        'messages.phone',
                        'Phone',
                        'លេខទូរស័ព្ទ'
                      )}

                    </p>


                    <div
                      className="
                        flex
                        items-center
                        gap-2

                        text-sm
                        font-medium
                        text-[#0D1B3E]
                      "
                    >

                      <FiPhone
                        className="
                          text-[#0D1B3E]
                          flex-shrink-0
                        "
                      />


                      {
                        selectedMessage.phone ||
                        tr(
                          'messages.notProvided',
                          'Not provided',
                          'មិនបានផ្តល់'
                        )
                      }

                    </div>

                  </div>

                </div>


                {/* =======================================
                    SUBJECT
                ======================================= */}

                <div
                  className="
                    mt-4
                  "
                >

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[#0D1B3E]

                      mb-2
                    "
                  >

                    {tr(
                      'messages.subject',
                      'Subject',
                      'ប្រធានបទ'
                    )}

                  </p>


                  <div
                    className="
                      px-4
                      py-3

                      rounded-xl

                      bg-[#F0F7FF]

                      border
                      border-[#E8EEF9]

                      text-sm
                      font-medium
                      text-[#0D1B3E]

                      break-words
                    "
                  >

                    {
                      selectedMessage.subject ||
                      tr(
                        'messages.noSubject',
                        'No subject',
                        'គ្មានប្រធានបទ'
                      )
                    }

                  </div>

                </div>


                {/* =======================================
                    MESSAGE
                ======================================= */}

                <div
                  className="
                    mt-4
                  "
                >

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[#0D1B3E]

                      mb-2
                    "
                  >

                    {tr(
                      'messages.message',
                      'Message',
                      'សារ'
                    )}

                  </p>


                  <div
                    className="
                      min-h-[140px]

                      p-4

                      rounded-xl

                      bg-[#F0F7FF]

                      border
                      border-[#E8EEF9]

                      text-sm
                      text-[#0D1B3E]

                      leading-7

                      whitespace-pre-wrap
                      break-words
                    "
                  >

                    {
                      selectedMessage.message ||
                      tr(
                        'messages.noMessage',
                        'No message',
                        'គ្មានសារ'
                      )
                    }

                  </div>

                </div>


                {/* =======================================
                    RECEIVED DATE
                ======================================= */}

                <div
                  className="
                    mt-4

                    flex
                    items-center
                    gap-2

                    text-xs
                    text-[#6B8AFF]
                  "
                >

                  <FiClock />


                  <span>

                    {tr(
                      'messages.received',
                      'Received',
                      'បានទទួល'
                    )}:

                  </span>


                  <span
                    className="
                      font-medium
                      text-[#0D1B3E]
                    "
                  >

                    {
                      formatDate(
                        selectedMessage.created_at
                      )
                    }

                  </span>

                </div>


                {/* =======================================
                    MODAL ACTIONS
                ======================================= */}

                <div
                  className="
                    mt-7

                    pt-5

                    border-t
                    border-[#E8EEF9]

                    flex
                    flex-col-reverse

                    sm:flex-row
                    sm:items-center
                    sm:justify-between

                    gap-3
                  "
                >

                  {/* DELETE */}

                  <button
                    type="button"

                    onClick={() =>
                      handleDelete(
                        selectedMessage.id
                      )
                    }

                    disabled={
                      actionLoading ===
                      `delete-${selectedMessage.id}`
                    }

                    className="
                      h-11

                      inline-flex
                      items-center
                      justify-center
                      gap-2

                      px-5

                      rounded-lg

                      bg-[#FFEBEE]
                      text-[#C62828]

                      border
                      border-[#FFCDD2]

                      text-sm
                      font-semibold

                      hover:bg-[#C62828]
                      hover:text-white
                      hover:border-[#C62828]

                      disabled:opacity-50
                      disabled:cursor-not-allowed

                      transition-all
                      duration-200
                    "
                  >

                    {
                      actionLoading ===
                      `delete-${selectedMessage.id}`
                        ? (

                            <span
                              className="
                                w-4
                                h-4

                                rounded-full

                                border-2
                                border-current/30
                                border-t-current

                                animate-spin
                              "
                            />

                          )
                        : (

                            <FiTrash2
                              size={16}
                            />

                          )
                    }


                    {tr(
                      'messages.deleteMessage',
                      'Delete Message',
                      'លុបសារ'
                    )}

                  </button>


                  {/* CLOSE */}

                  <button
                    type="button"

                    onClick={
                      closeModal
                    }

                    className="
                      h-11

                      px-6

                      rounded-lg

                      bg-[#0D1B3E]
                      hover:bg-[#0D1B3E]/90

                      text-white

                      text-sm
                      font-semibold

                      shadow-sm

                      transition-all
                      duration-200
                    "
                  >

                    {tr(
                      'messages.close',
                      'Close',
                      'បិទ'
                    )}

                  </button>

                </div>

              </div>

            )
          }

        </div>

      </AdminModal>

    </div>

  );

};


export default AdminMessages;